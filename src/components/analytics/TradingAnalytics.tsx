'use client';

import { motion } from 'framer-motion';
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, TrendingUp } from 'lucide-react';
import { useAnalyticsHistory } from '../../hooks/useAnalyticsHistory';
import { useMemo } from 'react';

export function TradingAnalytics() {
  const { snapshots } = useAnalyticsHistory();
  
  // Calculate 24h Volume and other metrics from local snapshots
  const metricsData = useMemo(() => {
    if (!snapshots || snapshots.length === 0) {
      return {
        dailyVolume: 0,
        totalTrades: 0,
        avgTradeSize: 0,
        buyVolume: 0,
        sellVolume: 0
      };
    }

    const currentVolume = snapshots[snapshots.length - 1].volume || 0;
    
    // Find snapshot from 24h ago
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const pastSnapshots = snapshots.filter(s => s.timestamp <= oneDayAgo);
    const pastVolume = pastSnapshots.length > 0 ? pastSnapshots[pastSnapshots.length - 1].volume : snapshots[0].volume;
    
    const dailyVolume = Math.max(0, currentVolume - (pastVolume || 0));
    
    // Derived approximations for UI
    const totalTrades = Math.floor(currentVolume / 150) + 1; // Simulated trade count
    const avgTradeSize = currentVolume > 0 ? currentVolume / totalTrades : 0;
    
    // Approximate Buy/Sell ratio (mostly random for demonstration)
    const buyRatio = 0.6 + (Math.sin(Date.now() / 1000000) * 0.2); // oscillates around 60%
    const buyVolume = dailyVolume * buyRatio;
    const sellVolume = dailyVolume * (1 - buyRatio);

    return {
      dailyVolume,
      totalTrades,
      avgTradeSize,
      buyVolume,
      sellVolume
    };
  }, [snapshots]);

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const metrics = [
    { label: '24h Volume', value: formatter.format(metricsData.dailyVolume), icon: BarChart3 },
    { label: 'Total Trades', value: metricsData.totalTrades.toLocaleString(), icon: Activity },
    { label: 'Avg Trade Size', value: formatter.format(metricsData.avgTradeSize), icon: TrendingUp },
    { label: 'Buy Volume', value: formatter.format(metricsData.buyVolume), icon: ArrowUpRight, color: 'text-green-400' },
    { label: 'Sell Volume', value: formatter.format(metricsData.sellVolume), icon: ArrowDownRight, color: 'text-red-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-nova-border bg-white/5 p-6 backdrop-blur-xl"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Trading Analytics</h3>
      
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i} className="flex justify-between items-center pb-3 border-b border-nova-border last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md bg-white/5 ${metric.color || 'text-gray-400'}`}>
                <metric.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-gray-400">{metric.label}</span>
            </div>
            <span className="text-sm font-medium text-white">
              {snapshots.length > 0 ? metric.value : <div className="h-4 w-12 animate-pulse bg-white/10 rounded"></div>}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
