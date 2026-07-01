import { Activity } from '../types';

export class ActivityService {
  static async getActivityHistory(walletAddress: string): Promise<Activity[]> {
    try {
      const res = await fetch(`/api/activity?user=${walletAddress}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.activities || [];
    } catch (e) {
      console.error('Failed to fetch activity:', e);
      return [];
    }
  }
}
