'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MintModal } from '@/components/modals/MintModal';

export default function VaultsPage() {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

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
            <h1 className="text-2xl font-semibold text-[#F5F5F2]">Yield Vaults</h1>
            <p className="mt-1 text-sm text-[#9A9A9A]">Manage your fixed and variable yield positions.</p>
          </div>
          <button
            onClick={() => setIsMintModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#3ECF8E] px-5 py-2 font-semibold text-black transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Mint PT & YT
          </button>
        </div>

        {/* Dummy content to show a Vault page skeleton */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111111] py-24 text-center">
          <p className="text-sm text-[#9A9A9A]">Vault details are populated via the Dashboard.</p>
          <button
            onClick={() => setIsMintModalOpen(true)}
            className="mt-4 text-sm font-medium text-[#3ECF8E] hover:underline"
          >
            Or mint new tokens now
          </button>
        </div>
      </div>

      <MintModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)} 
        defaultAsset="USDC" 
      />
    </motion.div>
  );
}
