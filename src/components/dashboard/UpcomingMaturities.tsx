'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Timer } from 'lucide-react';

const MATURITIES = [
  {
    id: 1,
    vault: 'USDC Core Vault',
    asset: 'PT-USDC',
    date: 'Dec 31, 2026',
    days: 45,
    value: '$42,500.00',
  },
  {
    id: 2,
    vault: 'XLM Yield Optimizer',
    asset: 'PT-XLM',
    date: 'Jan 15, 2027',
    days: 60,
    value: '$18,200.50',
  },
  {
    id: 3,
    vault: 'yBTC Strategy',
    asset: 'PT-yBTC',
    date: 'Mar 01, 2027',
    days: 105,
    value: '$63,892.30',
  },
];

export function UpcomingMaturities() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
      className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
    >
      <div className="border-b border-white/10 p-6">
        <h3 className="font-serif text-[22px] text-[#F5F5F2] tracking-tight">Upcoming Maturities</h3>
        <p className="mt-1 text-xs text-[#9A9A9A]">Your Principal Tokens nearing maturity.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {MATURITIES.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
            className="group flex cursor-pointer items-center justify-between rounded-xl p-4 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#050505] border border-white/5 text-[#9A9A9A] transition-colors group-hover:text-[#3ECF8E] group-hover:border-[#3ECF8E]/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#F5F5F2]">{item.vault}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-[#F5F5F2]">
                    {item.asset}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#9A9A9A]">
                  <Timer className="h-3 w-3" />
                  <span>{item.date}</span>
                  <span className="text-[#3ECF8E]">• {item.days} days</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-serif text-[17px] text-[#F5F5F2]">{item.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="border-t border-white/10 p-4 text-center">
        <button className="text-xs font-medium text-[#9A9A9A] transition-colors hover:text-[#3ECF8E]">
          View All Positions →
        </button>
      </div>
    </motion.div>
  );
}
