'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../../hooks/usePortfolio';
import { YieldService } from '../../services/yieldService';

export function VaultPositionsTable() {
  const { portfolio, loading, error } = usePortfolio();
  const [vaults, setVaults] = useState<any[]>([]);

  useEffect(() => {
    YieldService.getVaults().then(setVaults).catch(console.error);
  }, []);

  const isDisconnected = error === 'Wallet not connected' || portfolio?.error === 'Wallet not connected';
  
  const vaultAssets = portfolio?.assets.filter(a => a.assetType === 'vault') || [];
  
  const positions = vaultAssets.map(asset => {
    // Attempt to extract underlying asset, e.g., "Novaire Vault (USDC)" -> "USDC"
    const match = asset.assetCode.match(/\((.*?)\)/);
    const underlying = match ? match[1] : 'Unknown';
    
    // Find matching vault config
    const activeVault = vaults.find(v => (Array.isArray(v.asset) ? v.asset.includes(underlying) : v.asset === underlying));
    
    let vaultName = asset.assetCode;
    let fixedApy = 0;
    let maturityDate = '--';
    let daysRemaining = 0;

    if (activeVault) {
      vaultName = `${activeVault.protocol} ${underlying} Vault`;
      fixedApy = activeVault.fixedApy;
      maturityDate = new Date(activeVault.maturityDate).toLocaleDateString();
      
      const timeDiff = new Date(activeVault.maturityDate).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    // Mock claimable yield for display purposes as it requires a smart contract read
    const claimableYield = asset.balance * (fixedApy / 100) * 0.1;

    return {
      vaultName,
      underlying,
      depositAmount: asset.balance,
      claimableYield,
      fixedApy,
      daysRemaining,
      maturityDate
    };
  });

  const isEmpty = !loading && !isDisconnected && positions.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
    >
      <div className="border-b border-white/10 p-6 flex justify-between items-center">
        <h3 className="font-serif text-[22px] text-[#F5F5F2] tracking-tight">Vault Positions</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#050505]/50 text-xs text-[#9A9A9A]">
            <tr>
              <th className="px-6 py-4 font-medium">Vault Name</th>
              <th className="px-6 py-4 font-medium">Underlying</th>
              <th className="px-6 py-4 font-medium text-right">Deposit Amount</th>
              <th className="px-6 py-4 font-medium text-right">Claimable Yield</th>
              <th className="px-6 py-4 font-medium text-right">Fixed APY</th>
              <th className="px-6 py-4 font-medium text-right">Days Remaining</th>
              <th className="px-6 py-4 font-medium">Maturity Date</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/5"></div>
                  </div>
                </td>
              </tr>
            )}

            {isDisconnected && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[#8E8E8E]">
                  Connect Wallet to view vault positions
                </td>
              </tr>
            )}

            {isEmpty && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[#8E8E8E]">
                  No Vault Positions Found
                </td>
              </tr>
            )}

            {!loading && !isDisconnected && !isEmpty && positions.map((pos, i) => (
              <motion.tr
                key={`${pos.vaultName}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                className="group transition-colors hover:bg-white/5"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-[#F5F5F2]">
                  {pos.vaultName}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-[#9A9A9A]">
                  {pos.underlying}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  {pos.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#3ECF8E]">
                  +{pos.claimableYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  {pos.fixedApy}%
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  {pos.daysRemaining} days
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-[#F5F5F2]">
                  {pos.maturityDate}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <button className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-[#9A9A9A] transition-all group-hover:border-[#3ECF8E] group-hover:bg-[#3ECF8E] group-hover:text-black">
                    Manage
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
