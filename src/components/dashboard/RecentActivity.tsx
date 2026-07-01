'use client';

import { motion } from 'framer-motion';
import { ArrowDownToLine, HandCoins, ArrowRightLeft, Layers } from 'lucide-react';

const ACTIVITY = [
  {
    id: 1,
    type: 'Minted PT & YT',
    vault: 'USDC Core Vault',
    amount: '10,000.00 USDC',
    time: '2h ago',
    icon: Layers,
  },
  {
    id: 2,
    type: 'Claimed Yield',
    vault: 'XLM Yield Optimizer',
    amount: '450.25 XLM',
    time: '5h ago',
    icon: HandCoins,
  },
  {
    id: 3,
    type: 'Deposited',
    vault: 'yBTC Strategy',
    amount: '0.5 yBTC',
    time: '1d ago',
    icon: ArrowDownToLine,
  },
  {
    id: 4,
    type: 'Swap PT',
    vault: 'USDC Core Vault',
    amount: '5,000.00 PT-USDC',
    time: '2d ago',
    icon: ArrowRightLeft,
  },
];

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
      className="flex h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
    >
      <div className="border-b border-white/10 p-6">
        <h3 className="font-serif text-[20px] text-[#F5F5F2] tracking-tight">Recent Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pr-2">
        <div className="relative border-l border-white/10 ml-4 space-y-6 pb-2">
          {ACTIVITY.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              className="relative pl-6 group"
            >
              {/* Timeline Dot/Icon */}
              <div className="absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#111111] border border-white/10 text-[#9A9A9A] transition-colors group-hover:text-[#3ECF8E] group-hover:border-[#3ECF8E]/30">
                <item.icon className="h-3 w-3" />
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-[#F5F5F2]">{item.type}</div>
                  <div className="text-xs text-[#9A9A9A] mt-0.5">{item.vault}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#F5F5F2]">{item.amount}</div>
                  <div className="text-xs text-[#9A9A9A] mt-0.5">{item.time}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
