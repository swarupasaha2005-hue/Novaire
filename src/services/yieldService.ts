import { Vault, YieldHistory } from '../types';
import { ProtocolService } from './protocolService';

export class YieldService {
  static async getVaults(): Promise<Vault[]> {
    let tvlUsd = 0;
    try {
      const state = await ProtocolService.getProtocolState();
      tvlUsd = state.tvlUsd;
    } catch (e) {
      console.warn("Could not fetch live TVL for Vault page");
    }

    return [
      {
        id: 'vault_xlm_01',
        asset: 'XLM',
        protocol: 'Novaire',
        tvlUsd: tvlUsd,
        fixedApy: 8.2,
        variableApy: 10.1,
        capacityUsd: 2000000,
        maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  static async getYieldHistory(vaultId: string): Promise<YieldHistory[]> {
    try {
      const res = await fetch('/api/history');
      if (!res.ok) return [];
      const history = await res.json();
      
      if (!Array.isArray(history)) return [];
      
      return history.map((h: any) => ({
        timestamp: new Date(h.timestamp).toISOString(),
        fixedApy: h.fixedApy || 0,
        variableApy: (h.fixedApy || 0) + 2.1, // Testnet approximation for variable yield
      }));
    } catch (e) {
      console.warn("Failed to fetch yield history from indexer", e);
      return [];
    }
  }


}
