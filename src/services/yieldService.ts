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
}
