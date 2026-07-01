import { Activity } from '../types';

export class ActivityService {
  static async getActivityHistory(walletAddress: string): Promise<Activity[]> {
    // TODO: Implement actual indexer/horizon fetching
    return [
      {
        id: 'tx_1',
        type: 'deposit',
        asset: 'USDC',
        amount: 1000,
        valueUsd: 1000,
        timestamp: new Date().toISOString(),
        txHash: '0x123...',
        status: 'completed',
      }
    ];
  }
}
