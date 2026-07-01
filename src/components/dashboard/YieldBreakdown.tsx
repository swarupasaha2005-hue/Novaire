'use client';

import { motion } from 'framer-motion';

export function YieldBreakdown() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
      className="flex h-[320px] flex-col rounded-2xl border border-white/10 bg-[#111111] p-6 transition-colors hover:border-[#3ECF8E]/50"
    >
      <h3 className="font-serif text-[20px] text-[#F5F5F2] tracking-tight">Yield Breakdown</h3>
      
      <div className="mt-6 flex flex-1 items-center justify-between">
        
        {/* Custom SVG Circular Progress */}
        <div className="relative h-32 w-32 ml-4">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            {/* Background Ring */}
            <path
              className="text-white/5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            {/* Variable Yield (Inner/Total) */}
            <motion.path
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: '85 15' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#F5F5F2"
              strokeWidth="2.5"
            />
            {/* Fixed Yield (Highlight) */}
            <motion.path
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: '65 35' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3ECF8E"
              strokeWidth="2.5"
            />
          </svg>
          {/* Inner Total APY */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-[22px] text-[#3ECF8E]">14.2%</span>
            <span className="text-[9px] text-[#9A9A9A] uppercase tracking-wider mt-0.5">Total APY</span>
          </div>
        </div>

        {/* Details List */}
        <div className="flex flex-col gap-5 mr-2">
          
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#3ECF8E]" />
              <span className="text-xs text-[#9A9A9A]">Fixed Base APY</span>
            </div>
            <div className="pl-3.5 font-medium text-[#F5F5F2] text-sm">9.50%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#F5F5F2]" />
              <span className="text-xs text-[#9A9A9A]">Est. Variable Yield</span>
            </div>
            <div className="pl-3.5 font-medium text-[#F5F5F2] text-sm">4.70%</div>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}
