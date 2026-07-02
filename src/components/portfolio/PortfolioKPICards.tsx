'use client';

import { motion } from 'framer-motion';
import { Briefcase, HandCoins, Activity, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useState, useEffect } from 'react';
import { YieldService } from '../../services/yieldService';

export function PortfolioKPICards() {
  const { portfolio, loading, error } = usePortfolio();
  const [vaults, setVaults] = useState<any[]>([]);

  useEffect(() => {
    YieldService.getVaults().then(setVaults).catch(console.error);
  }, []);

  const getPortfolioValue = () => {
    if (loading) return <div className="h-8 w-32 animate-pulse rounded bg-white/10" />;
    if (error === 'Wallet not connected' || portfolio?.error === 'Wallet not connected') return 'Connect Wallet';
    if (!portfolio || isNaN(portfolio.totalValueUsd) || portfolio.totalValueUsd === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(portfolio.totalValueUsd);
  };

  // Determine Yield Positions
  const yieldAssets = portfolio?.assets.filter(a => a.assetType === 'pt' || a.assetType === 'yt') || [];
  const totalYieldPositions = yieldAssets.length;

  // Determine Active Vaults derived directly from Yield Positions
  const activeVaultsCount = new Set(yieldAssets.map(a => a.issuer)).size;

  // Calculate Mock Claimable Yield based on vault balances
  let claimableYield = 0;
  const vaultAssets = portfolio?.assets.filter(a => a.assetType === 'vault') || [];
  vaultAssets.forEach(asset => {
    const match = asset.assetCode.match(/\((.*?)\)/);
    const underlying = match ? match[1] : 'Unknown';
    const activeVault = vaults.find(v => (Array.isArray(v.asset) ? v.asset.includes(underlying) : v.asset === underlying));
    if (activeVault && !isNaN(asset.balance) && typeof activeVault.fixedApy === 'number' && !isNaN(activeVault.fixedApy)) {
      const addedYield = asset.balance * (activeVault.fixedApy / 100) * 0.1;
      if (!isNaN(addedYield) && isFinite(addedYield)) claimableYield += addedYield;
    }
  });

  const getClaimableYield = () => {
    if (loading) return <div className="h-8 w-32 animate-pulse rounded bg-white/10" />;
    if (error === 'Wallet not connected' || portfolio?.error === 'Wallet not connected') return 'Connect Wallet';
    if (isNaN(claimableYield) || claimableYield === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(claimableYield);
  };

  const getNumericMetric = (value: number) => {
    if (loading) return <div className="h-8 w-16 animate-pulse rounded bg-white/10" />;
    if (error === 'Wallet not connected' || portfolio?.error === 'Wallet not connected') return '-';
    return value.toString();
  };

  const kpis = [
    {
      id: 'portfolio',
      label: 'Total Portfolio Value',
      value: getPortfolioValue(),
      change: '+2.4%', // Mock change for visual continuity with dashboard
      isPositive: true,
      icon: Briefcase,
      sparkline: 'M0,15 Q5,5 10,12 T20,10 T30,18 T40,5 T50,8',
    },
    {
      id: 'positions',
      label: 'Total Yield Positions',
      value: getNumericMetric(totalYieldPositions),
      change: 'Active',
      isPositive: true,
      icon: Activity,
      sparkline: 'M0,15 Q10,5 20,12 T30,4 T40,15 T50,8',
    },
    {
      id: 'claimable',
      label: 'Claimable Yield',
      value: getClaimableYield(),
      change: 'Ready',
      isPositive: true,
      icon: HandCoins,
      sparkline: 'M0,10 Q10,15 20,10 T30,12 T40,8 T50,5',
    },
    {
      id: 'vaults',
      label: 'Active Vaults',
      value: getNumericMetric(activeVaultsCount),
      change: 'Stable',
      isPositive: true,
      icon: ShieldCheck,
      sparkline: 'M0,18 Q15,8 25,12 T40,5 T50,0',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
          whileHover={{ scale: 1.01 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 transition-colors hover:border-[#3ECF8E]/50"
        >
          {/* Top Row: Icon & Label */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[#9A9A9A] transition-colors group-hover:text-[#3ECF8E]">
              <kpi.icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-[#9A9A9A]">{kpi.label}</span>
          </div>

          {/* Value & Change */}
          <div className="mt-2 flex items-end justify-between relative z-10">
            <div>
              <div className="font-serif text-xl text-[#F5F5F2] tracking-tight">
                {kpi.value}
              </div>
              <div className={`mt-0 text-[11px] font-medium ${kpi.isPositive ? 'text-[#3ECF8E]' : 'text-red-400'}`}>
                {loading ? '' : kpi.change}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="absolute -bottom-1 left-0 right-0 h-6 opacity-30 transition-opacity group-hover:opacity-100 z-0 pointer-events-none">
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
                fill="url(#sparkline-gradient-portfolio)"
                stroke="none"
              />
              <defs>
                <linearGradient id="sparkline-gradient-portfolio" x1="0" y1="0" x2="0" y2="1">
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
