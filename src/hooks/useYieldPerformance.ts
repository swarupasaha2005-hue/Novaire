import { useState, useEffect } from 'react';
import { YieldService } from '../services/yieldService';

export interface PerformanceDataPoint {
  date: string;
  underlying: number;
  pt: number;
  yt: number;
}

export function useYieldPerformance(timeframe: string, hasYieldPosition: boolean) {
  const [data, setData] = useState<PerformanceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const history = await YieldService.getPerformanceHistory(timeframe, hasYieldPosition);
        if (mounted) {
          setData(history);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [timeframe, hasYieldPosition]);

  return { data, loading, error };
}
