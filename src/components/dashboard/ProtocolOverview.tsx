'use client';

import { motion } from 'framer-motion';

const METRICS = [
  { label: 'Protocol TVL', value: '$24.8M' },
  { label: '30 Day Volume', value: '$12.1M' },
  { label: 'Active Vaults', value: '7' },
  { label: 'Avg Fixed APY', value: '12.4%' },
  { label: 'Utilization', value: '88.5%' },
  { label: 'Total Users', value: '3,842' },
];

export function ProtocolOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
      className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 transition-colors hover:border-[#3ECF8E]/50"
    >
      <h3 className="font-serif text-[22px] text-[#F5F5F2] tracking-tight">Protocol Overview</h3>
      <p className="mt-1 text-xs text-[#9A9A9A]">Network statistics</p>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        {METRICS.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
            className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
          >
            <span className="text-sm text-[#9A9A9A]">{metric.label}</span>
            <span className="font-medium text-[#F5F5F2]">{metric.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-4">
        <button className="w-full rounded-lg bg-white/5 py-2.5 text-xs font-medium text-[#9A9A9A] transition-colors hover:bg-white/10 hover:text-[#F5F5F2]">
          View Full Analytics
        </button>
      </div>
    </motion.div>
  );
}
