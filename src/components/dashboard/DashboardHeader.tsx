'use client';

import { motion } from 'framer-motion';
import { Bell, Wallet, CircleUser } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';

export function DashboardHeader() {
  const { isConnected, address, connect, disconnect } = useWallet();

  const formattedAddress = address 
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : '';

  return (
    <div className="flex items-center justify-start gap-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex items-center gap-4"
      >
        {/* Connected Status & Wallet */}
        {isConnected ? (
          <button 
            onClick={disconnect}
            title="Disconnect Wallet"
            className="flex h-10 items-center gap-3 rounded-xl border border-white/10 bg-[#111111] px-4 py-2 transition-colors hover:border-red-500/30 group"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ECF8E] opacity-75 group-hover:hidden"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ECF8E] group-hover:bg-red-500"></span>
              </span>
              <span className="text-xs font-medium text-[#3ECF8E] group-hover:text-red-500 transition-colors">Connected</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 group-hover:bg-red-500/20 transition-colors" />
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#9A9A9A] group-hover:text-red-500/80 transition-colors" />
              <span className="text-sm font-medium text-[#F5F5F2] group-hover:text-red-500/90 transition-colors">{formattedAddress}</span>
            </div>
          </button>
        ) : (
          <button 
            onClick={connect}
            className="flex h-10 items-center gap-3 rounded-xl border border-white/10 bg-[#111111] px-4 py-2 transition-colors hover:border-[#3ECF8E]/50 group"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#9A9A9A] group-hover:text-[#3ECF8E] transition-colors" />
              <span className="text-sm font-medium text-[#F5F5F2] group-hover:text-[#3ECF8E] transition-colors">Connect Wallet</span>
            </div>
          </button>
        )}

        {/* Notification Button */}
        <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111111] transition-all duration-300 hover:border-[#3ECF8E] hover:bg-[#3ECF8E] hover:text-black text-[#9A9A9A]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#3ECF8E] group-hover:bg-black" />
        </button>

        {/* Profile Button */}
        <button className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111111] transition-all duration-300 hover:border-[#3ECF8E] hover:bg-[#3ECF8E] hover:text-black text-[#9A9A9A]">
          <CircleUser className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
