'use client';

import { motion } from 'framer-motion';
import { TradeInterface } from '@/components/trade/TradeInterface';
import { ProtocolDashboard } from '@/components/trade/ProtocolDashboard';

export default function TradePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full px-6 pt-6 pb-24"
    >
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#F5F5F2]">Trade</h1>
            <p className="mt-1 text-sm text-[#9A9A9A]">
              Swap fixed and variable yield tokens with minimal slippage.
            </p>
          </div>
        </div>

        <div className="flex w-full items-start gap-8 mt-4 flex-col lg:flex-row">
          {/* Main Trading Interface */}
          <div className="flex-1 w-full max-w-xl mx-auto lg:mx-0">
            <TradeInterface />
          </div>

          {/* Secondary Panel: Live Protocol Dashboard */}
          <ProtocolDashboard />
        </div>
      </div>
    </motion.div>
  );
}
