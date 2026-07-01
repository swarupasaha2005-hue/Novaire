'use client';

import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, HandCoins, PiggyBank, Activity, ShieldCheck } from 'lucide-react';

const KPIS = [
  {
    id: 'portfolio',
    label: 'Portfolio Value',
    value: '$124,592.80',
    change: '+2.4%',
    isPositive: true,
    icon: Briefcase,
    sparkline: 'M0,15 Q5,5 10,12 T20,10 T30,18 T40,5 T50,8',
  },
  {
    id: 'yield',
    label: "Today's Yield",
    value: '+$142.50',
    change: '+0.8%',
    isPositive: true,
    icon: TrendingUp,
    sparkline: 'M0,18 Q8,10 15,15 T25,8 T35,12 T45,4 T50,2',
  },
  {
    id: 'claimable',
    label: 'Claimable Yield',
    value: '$892.40',
    change: 'Ready',
    isPositive: true,
    icon: HandCoins,
    sparkline: 'M0,10 Q10,15 20,10 T30,12 T40,8 T50,5',
  },
  {
    id: 'invested',
    label: 'Total Invested',
    value: '$110,000.00',
    change: '0.0%',
    isPositive: true,
    icon: PiggyBank,
    sparkline: 'M0,10 L50,10',
  },
  {
    id: 'positions',
    label: 'Active Positions',
    value: '4',
    change: '+1',
    isPositive: true,
    icon: Activity,
    sparkline: 'M0,15 Q10,5 20,12 T30,4 T40,15 T50,8',
  },
  {
    id: 'tvl',
    label: 'Protocol TVL',
    value: '$24.8M',
    change: '+12.4%',
    isPositive: true,
    icon: ShieldCheck,
    sparkline: 'M0,18 Q15,8 25,12 T40,5 T50,0',
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">
      {KPIS.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
          whileHover={{ scale: 1.01 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 transition-colors hover:border-[#3ECF8E]/50"
        >
          {/* Top Row: Icon & Label */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[#9A9A9A] transition-colors group-hover:text-[#3ECF8E]">
              <kpi.icon className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-medium text-[#9A9A9A]">{kpi.label}</span>
          </div>

          {/* Value & Change */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="font-serif text-2xl text-[#F5F5F2] tracking-tight">{kpi.value}</div>
              <div className={`mt-1 text-xs font-medium ${kpi.isPositive ? 'text-[#3ECF8E]' : 'text-red-400'}`}>
                {kpi.change}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 transition-opacity group-hover:opacity-100">
            <svg width="100%" height="100%" viewBox="0 0 50 20" preserveAspectRatio="none">
              <path
                d={kpi.sparkline}
                fill="none"
                stroke="#3ECF8E"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`${kpi.sparkline} L50,20 L0,20 Z`}
                fill="url(#sparkline-gradient)"
                stroke="none"
              />
              <defs>
                <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ECF8E" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3ECF8E" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
