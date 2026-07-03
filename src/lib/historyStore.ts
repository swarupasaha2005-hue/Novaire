/**
 * File-based protocol history store.
 *
 * Replaces Prisma/SQLite for the dev/testnet environment.
 * Stores ProtocolHistory entries as a JSON array on disk.
 * Never throws — always returns safe defaults.
 */
import fs from 'fs';
import path from 'path';

export interface ProtocolHistoryEntry {
  id: string;
  timestamp: string; // ISO string
  ptPrice: number;
  ytPrice: number;
  tvl: number;
  fixedApy: number;
  tradingVolume: number;
  eventType: string | null;
  txHash: string | null;
}

export interface SyncStateEntry {
  id: string;
  lastLedger: number;
  updatedAt: string;
}

interface StoreData {
  history: ProtocolHistoryEntry[];
  syncState: SyncStateEntry;
}

// Store alongside the SQLite db file — at project root
const STORE_PATH = path.join(process.cwd(), 'history-store.json');

function readStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // Corrupt or missing — start fresh
  }
  return {
    history: [],
    syncState: { id: 'singleton', lastLedger: 0, updatedAt: new Date().toISOString() },
  };
}

function writeStore(data: StoreData): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[HistoryStore] Failed to write store:', err);
  }
}

export const HistoryStore = {
  getHistory(limit = 5000): ProtocolHistoryEntry[] {
    const data = readStore();
    // Return oldest-first, capped at limit
    return data.history.slice(-limit);
  },

  addHistoryEntry(entry: Omit<ProtocolHistoryEntry, 'id' | 'timestamp'>): ProtocolHistoryEntry {
    const data = readStore();
    const newEntry: ProtocolHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    data.history.push(newEntry);

    // Keep at most 10000 entries to avoid unbounded growth
    if (data.history.length > 10000) {
      data.history = data.history.slice(-10000);
    }

    writeStore(data);
    return newEntry;
  },

  getSyncState(): SyncStateEntry {
    return readStore().syncState;
  },

  upsertSyncState(lastLedger: number): SyncStateEntry {
    const data = readStore();
    data.syncState = {
      id: 'singleton',
      lastLedger,
      updatedAt: new Date().toISOString(),
    };
    writeStore(data);
    return data.syncState;
  },
};
