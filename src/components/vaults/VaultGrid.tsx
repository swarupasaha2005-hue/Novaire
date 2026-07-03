import { motion } from 'framer-motion';
import { Vault } from '../../types';
import { ProtocolState } from '@/services/protocolService';

interface VaultGridProps {
  vaults: Vault[];
  protocolState: ProtocolState | null;
  onDeposit: (asset: string) => void;
}

export function VaultGrid({ vaults, protocolState, onDeposit }: VaultGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {vaults.map((vault, i) => {
        const maturity = new Date(vault.maturityDate);
        const now = new Date();
        const diffTime = maturity.getTime() - now.getTime();
        const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        return (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
          >
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                    <span className="font-bold text-white">{vault.asset.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#F5F5F2]">{vault.protocol} {vault.asset} Vault</h3>
                    <p className="text-xs text-[#9A9A9A]">Current Epoch</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-full bg-[#3ECF8E]/10 px-2.5 py-1 text-xs font-medium text-[#3ECF8E]">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#9A9A9A] mb-1">Fixed APY</p>
                  <p className="text-sm font-semibold text-[#3ECF8E]">
                    {vault.fixedApy.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9A9A9A] mb-1">TVL</p>
                  <p className="text-sm font-semibold text-[#F5F5F2]">
                    {protocolState ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(protocolState.tvlXlm)} XLM` : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-between gap-6 bg-white/[0.02]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9A9A9A]">Maturity Date</span>
                <span className="font-medium text-[#F5F5F2]">
                  {maturity.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9A9A9A]">Days Remaining</span>
                <span className="font-medium text-[#F5F5F2]">{diffDays} days</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={() => onDeposit(vault.asset)}
                  className="rounded-xl bg-[#3ECF8E] py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Deposit
                </button>
                <button 
                  className="rounded-xl border border-white/10 bg-transparent py-2.5 text-sm font-medium text-[#F5F5F2] transition-colors hover:bg-white/5"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
