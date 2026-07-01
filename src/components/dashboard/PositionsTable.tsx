'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '../../hooks/usePortfolio';

export function PositionsTable() {
  const { portfolio, loading, error } = usePortfolio();

  const isDisconnected = error === 'Wallet not connected' || portfolio?.error === 'Wallet not connected';
  const assets = portfolio?.assets || [];
  const isEmpty = !loading && !isDisconnected && assets.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
    >
      <div className="border-b border-white/10 p-6">
        <h3 className="font-serif text-[22px] text-[#F5F5F2] tracking-tight">Your Positions</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#050505]/50 text-xs text-[#9A9A9A]">
            <tr>
              <th className="px-6 py-4 font-medium">Asset</th>
              <th className="px-6 py-4 font-medium text-right">Balance</th>
              <th className="px-6 py-4 font-medium text-right">Current Price</th>
              <th className="px-6 py-4 font-medium text-right">Current Value</th>
              <th className="px-6 py-4 font-medium text-right">PT Balance</th>
              <th className="px-6 py-4 font-medium text-right">YT Balance</th>
              <th className="px-6 py-4 font-medium text-right">Fixed APY</th>
              <th className="px-6 py-4 font-medium">Maturity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-white/5"></div>
                    <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/5"></div>
                    <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/5"></div>
                  </div>
                </td>
              </tr>
            )}

            {isDisconnected && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-[#8E8E8E]">
                  Connect Wallet to view positions
                </td>
              </tr>
            )}

            {isEmpty && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-[#8E8E8E]">
                  No Assets Found
                </td>
              </tr>
            )}

            {!loading && !isDisconnected && !isEmpty && assets.map((asset, i) => (
              <motion.tr
                key={`${asset.assetCode}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
                className="group transition-colors hover:bg-white/5"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-[#F5F5F2]">
                  {asset.assetCode}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#9A9A9A]">
                  {asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#9A9A9A]">
                  ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  ${asset.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  0.00
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  0.00
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#3ECF8E]">
                  --
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-[#9A9A9A]">
                  --
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[#9A9A9A]">
                    Uninvested
                  </span>
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

      <div className="border-t border-white/10 p-4 text-center">
        <button className="text-xs font-medium text-[#9A9A9A] transition-colors hover:text-[#3ECF8E]">
          View All Positions →
        </button>
      </div>
    </motion.div>
  );
}
