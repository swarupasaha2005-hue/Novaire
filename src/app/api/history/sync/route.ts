import { NextResponse } from 'next/server';
import { rpc } from '@stellar/stellar-sdk';
import { CONTRACTS, RPC_URL } from '@/config/contracts';
import { ProtocolService } from '@/services/protocolService';
import { HistoryStore } from '@/lib/historyStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const server = new rpc.Server(RPC_URL);
    const syncState = HistoryStore.getSyncState();

    let startLedger = syncState.lastLedger;

    // Get current ledger
    let currentLedger: number;
    try {
      const latestLedgerResponse = await server.getLatestLedger();
      currentLedger = latestLedgerResponse.sequence;
    } catch (err) {
      console.warn('[/api/history/sync] Could not reach Stellar RPC, skipping sync:', err);
      return NextResponse.json({ success: true, syncedTo: startLedger, skipped: true });
    }

    // On first sync, start from 1000 ledgers ago to avoid huge initial range
    if (startLedger === 0 || currentLedger - startLedger > 1000) {
      startLedger = Math.max(0, currentLedger - 1000);
    }

    let hasNewEvents = false;

    if (startLedger < currentLedger) {
      try {
        const eventsResponse = await server.getEvents({
          startLedger,
          filters: [
            {
              type: 'contract',
              contractIds: [CONTRACTS.MARKETPLACE, CONTRACTS.VAULT],
            },
          ],
          limit: 100,
        });

        if (eventsResponse.events && eventsResponse.events.length > 0) {
          hasNewEvents = true;
        }
      } catch (e) {
        // Event fetch failed — still snapshot the current state
        console.warn('[/api/history/sync] Failed to fetch Soroban events, snapshotting anyway:', e);
        hasNewEvents = true;
      }
    }

    if (hasNewEvents || syncState.lastLedger === 0) {
      try {
        const state = await ProtocolService.getProtocolState();

        // Validate the fetched state before persisting — skip if values are clearly invalid
        const ptPrice = Number(state.ptPriceUnderlying);
        const ytPrice = Math.max(0, 1.0 - ptPrice);
        const tvl = Number(state.tvlUsd);
        const fixedApy = Number(state.impliedYieldApy);

        if (
          isFinite(ptPrice) && !isNaN(ptPrice) &&
          isFinite(tvl) && !isNaN(tvl) &&
          isFinite(fixedApy) && !isNaN(fixedApy)
        ) {
          HistoryStore.addHistoryEntry({
            ptPrice,
            ytPrice,
            tvl,
            fixedApy,
            tradingVolume: 0,
            eventType: 'sync',
            txHash: null,
          });
        } else {
          console.warn('[/api/history/sync] Protocol state returned invalid values, skipping snapshot.');
        }
      } catch (stateErr) {
        // Protocol state unavailable — do not write a zero snapshot
        console.warn('[/api/history/sync] Could not fetch protocol state, skipping snapshot:', stateErr);
      }

      HistoryStore.upsertSyncState(currentLedger);
    }

    return NextResponse.json({ success: true, syncedTo: currentLedger });
  } catch (error) {
    // Top-level guard — never return 500
    console.error('[/api/history/sync] Unexpected error:', error);
    return NextResponse.json({ success: true, syncedTo: 0, error: String(error) });
  }
}
