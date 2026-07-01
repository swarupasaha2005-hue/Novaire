'use client';

import { motion } from 'framer-motion';

const DATA = [
  { label: 'PT (Principal)', value: 85000, color: '#3ECF8E', dash: '0 100' },
  { label: 'YT (Yield)', value: 25000, color: '#F5F5F2', dash: '68 100' },
  { label: 'Cash (Uninvested)', value: 14592.8, color: '#4A4A4A', dash: '88 100' },
];

export function AssetAllocation() {
  const total = DATA.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
      className="flex h-[320px] flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 transition-colors hover:border-[#3ECF8E]/50"
    >
      <h3 className="font-serif text-[20px] text-[#F5F5F2] tracking-tight">Asset Allocation</h3>
      
      <div className="mt-6 flex flex-1 items-center justify-between">
        
        {/* Custom SVG Donut Chart */}
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            {/* Background Ring */}
            <path
              className="text-white/5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {/* Segments (Simulated via stroke-dasharray) */}
            <motion.path
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: '68 32' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3ECF8E"
              strokeWidth="3"
            />
            <motion.path
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: '20 80' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.7 }}
              strokeDashoffset="-68"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#F5F5F2"
              strokeWidth="3"
            />
            <motion.path
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: '12 88' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.9 }}
              strokeDashoffset="-88"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#4A4A4A"
              strokeWidth="3"
            />
          </svg>
          {/* Inner Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-[#9A9A9A] uppercase tracking-wider">Total</span>
            <span className="font-serif text-[15px] text-[#F5F5F2] mt-0.5">
              ${(total / 1000).toFixed(1)}k
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4">
          {DATA.map((item, i) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-[#9A9A9A]">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#F5F5F2]">
                    ${item.value.toLocaleString()}
                  </span>
                  <span className="w-8 text-right text-[10px] text-[#9A9A9A]">{percentage}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}
