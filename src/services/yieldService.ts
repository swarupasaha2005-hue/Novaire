import { Vault, YieldHistory } from '../types';

export class YieldService {
  static async getVaults(): Promise<Vault[]> {
    // TODO: Implement actual data fetching from Soroban contracts
    return [
      {
        id: 'vault_usdc_01',
        asset: 'USDC',
        protocol: 'Novaire',
        tvlUsd: 1500000,
        fixedApy: 10.5,
        variableApy: 12.8,
        capacityUsd: 5000000,
        maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'vault_xlm_01',
        asset: 'XLM',
        protocol: 'Novaire',
        tvlUsd: 800000,
        fixedApy: 8.2,
        variableApy: 10.1,
        capacityUsd: 2000000,
        maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  static async getYieldHistory(vaultId: string): Promise<YieldHistory[]> {
    // TODO: Implement historical data fetching
    return [
      { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), fixedApy: 10.5, variableApy: 12.1 },
      { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), fixedApy: 10.5, variableApy: 12.5 },
      { timestamp: new Date().toISOString(), fixedApy: 10.5, variableApy: 12.8 },
    ];
  }

  static async getPerformanceHistory(timeframe: string, hasYieldPosition: boolean = true): Promise<{ date: string; underlying: number; pt: number; yt: number; }[]> {
    // TODO: Connect this to Soroban events indexer
    const points = timeframe === '1D' ? 24 : timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : timeframe === '90D' ? 90 : 180;
    const data = [];
    
    let baseUnderlying = 10000;
    let basePt = hasYieldPosition ? 5000 : 0;
    let baseYt = hasYieldPosition ? 5000 : 0;
    
    // Simulate trend
    for (let i = points; i >= 0; i--) {
      const date = new Date(Date.now() - i * (timeframe === '1D' ? 3600000 : 86400000));
      
      baseUnderlying += (Math.random() - 0.4) * 100;
      if (hasYieldPosition) {
        basePt += (Math.random() - 0.35) * 50; // PT steadily grows
        baseYt += (Math.random() - 0.5) * 80;  // YT more volatile
      }
      
      data.push({
        date: date.toISOString(),
        underlying: Math.max(0, baseUnderlying),
        pt: hasYieldPosition ? Math.max(0, basePt) : 0,
        yt: hasYieldPosition ? Math.max(0, baseYt) : 0
      });
    }
    
    return data;
  }
}
