'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Shield,
  ArrowRightLeft,
  Zap,
  BarChart2,
  Settings,
  Search,
  Globe,
  CircleUser,
} from 'lucide-react';

const NAV_ICONS = [
  { icon: LayoutDashboard, href: '/app' },
  { icon: Wallet, href: '/app/portfolio' },
  { icon: Shield, href: '/app/vaults' },
  { icon: ArrowRightLeft, href: '/app/trade' },
  { icon: Zap, href: '/app/automation' },
  { icon: BarChart2, href: '/app/analytics' },
  { icon: Search, href: '/app/explorer' },
  { icon: Settings, href: '/app/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-screen w-[80px] flex-col items-center border-r border-white/10 bg-[#0A0A0A] py-6 flex-shrink-0"
    >
      {/* Top Logo */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] border border-white/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[#F5F5F2]"
        >
          <path
            d="M12 2L2 22h20L12 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="my-6 h-[1px] w-8 bg-white/10" />

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-6">
        {NAV_ICONS.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
              className="relative w-full flex justify-center"
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-md bg-[#3ECF8E]"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Link
                href={item.href}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#111111] text-[#3ECF8E] border border-white/5'
                    : 'text-[#8E8E8E] hover:bg-[rgba(62,207,142,0.08)] hover:text-[#F5F5F2]'
                }`}
              >
                <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2 : 1.5} />
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Area */}
      <div className="flex flex-col items-center gap-6 mt-auto">
        <button className="text-[#8E8E8E] transition-colors hover:text-[#F5F5F2]">
          <CircleUser className="h-[22px] w-[22px]" strokeWidth={1.5} />
        </button>
        <button className="text-[#8E8E8E] transition-colors hover:text-[#F5F5F2]">
          <Globe className="h-[22px] w-[22px]" strokeWidth={1.5} />
        </button>
        <button className="text-[#8E8E8E] transition-colors hover:text-[#F5F5F2]">
          <Wallet className="h-[22px] w-[22px]" strokeWidth={1.5} />
        </button>
        
        <div className="mt-2 flex h-8 w-8 items-center justify-center opacity-50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#8E8E8E]"
          >
            <path
              d="M12 2L2 22h20L12 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.aside>
  );
}
