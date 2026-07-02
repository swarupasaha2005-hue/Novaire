'use client';

import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PortfolioKPICards } from '@/components/portfolio/PortfolioKPICards';
import { WalletAssetsTable } from '@/components/portfolio/WalletAssetsTable';
import { YieldPositionsTable } from '@/components/portfolio/YieldPositionsTable';
import { VaultPositionsTable } from '@/components/portfolio/VaultPositionsTable';
import { AssetAllocation } from '@/components/dashboard/AssetAllocation';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function PortfolioPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full px-6 pt-6 pb-24"
    >
      <div className="flex flex-col gap-6 pb-24">
        {/* Header - includes Connect Wallet and Mint PT & YT button */}
        <DashboardHeader />

        {/* SECTION 1: Portfolio Summary KPIs */}
        <PortfolioKPICards />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 flex flex-col gap-6">
            {/* SECTION 2: Wallet Assets */}
            <WalletAssetsTable />

            {/* SECTION 3: Yield Positions */}
            <YieldPositionsTable />

            {/* SECTION 4: Vault Positions */}
            <VaultPositionsTable />
          </div>

          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* SECTION 5: Portfolio Allocation */}
            <AssetAllocation />

            {/* SECTION 6: Recent Portfolio Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
