'use client';

import { motion } from 'framer-motion';

const POSITIONS = [
  {
    id: 1,
    vault: 'USDC Core',
    asset: 'USDC',
    pt: '10,000.00',
    yt: '10,000.00',
    value: '$9,850.25',
    apy: '9.5%',
    maturity: 'Dec 31, 2026',
    status: 'Active',
  },
  {
    id: 2,
    vault: 'XLM Optimizer',
    asset: 'XLM',
    pt: '45,200.00',
    yt: '0.00',
    value: '$12,430.80',
    apy: '12.4%',
    maturity: 'Jan 15, 2027',
    status: 'Active',
  },
  {
    id: 3,
    vault: 'yBTC Strategy',
    asset: 'yBTC',
    pt: '0.00',
    yt: '2.50',
    value: '$1,200.00',
    apy: '8.2%',
    maturity: 'Mar 01, 2027',
    status: 'Pending',
  },
  {
    id: 4,
    vault: 'USDT Yield',
    asset: 'USDT',
    pt: '5,000.00',
    yt: '5,000.00',
    value: '$5,000.00',
    apy: '10.1%',
    maturity: 'May 01, 2025',
    status: 'Matured',
  },
];

export function PositionsTable() {
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
              <th className="px-6 py-4 font-medium">Vault</th>
              <th className="px-6 py-4 font-medium">Asset</th>
              <th className="px-6 py-4 font-medium text-right">PT Balance</th>
              <th className="px-6 py-4 font-medium text-right">YT Balance</th>
              <th className="px-6 py-4 font-medium text-right">Current Value</th>
              <th className="px-6 py-4 font-medium text-right">Fixed APY</th>
              <th className="px-6 py-4 font-medium">Maturity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {POSITIONS.map((pos, i) => (
              <motion.tr
                key={pos.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.65 + i * 0.05 }}
                className="group transition-colors hover:bg-white/5"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-[#F5F5F2]">
                  {pos.vault}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-[#9A9A9A]">
                  {pos.asset}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  {pos.pt}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  {pos.yt}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#F5F5F2]">
                  {pos.value}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-[#3ECF8E]">
                  {pos.apy}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-[#9A9A9A]">
                  {pos.maturity}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      pos.status === 'Active'
                        ? 'bg-[#3ECF8E]/10 text-[#3ECF8E]'
                        : pos.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-white/10 text-[#9A9A9A]'
                    }`}
                  >
                    {pos.status}
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
