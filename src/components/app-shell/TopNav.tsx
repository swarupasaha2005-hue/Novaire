'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Bell, Settings } from 'lucide-react';

const TOP_LINKS = [
  { label: 'Dashboard', href: '/app' },
  { label: 'Portfolio', href: '/app/portfolio' },
  { label: 'Vaults', href: '/app/vaults' },
  { label: 'Trade', href: '/app/trade' },
  { label: 'Automation', href: '/app/automation' },
  { label: 'Analytics', href: '/app/analytics' },
  { label: 'Resources', href: '/app/resources' },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      className="flex h-[68px] w-full shrink-0 items-center justify-between border-b border-white/10 bg-[#0A0A0A] px-6"
    >
      {/* Left: Wordmark & Links */}
      <div className="flex h-full items-center gap-8">
        <Image 
          src="/images/logos-v2.png" 
          alt="Novaire" 
          width={180} 
          height={36} 
          className="h-[36px] w-auto object-contain"
        />
        
        <nav className="hidden h-full md:flex items-center gap-6">
          {TOP_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-full items-center text-[14px] font-medium transition-colors ${
                  isActive ? 'text-[#F5F5F2]' : 'text-[#8E8E8E] hover:text-[#F5F5F2]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTopNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3ECF8E]"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8E8E8E]" />
          <input
            type="text"
            placeholder="Search vaults, PT, YT..."
            className="h-10 w-full rounded-full border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-[#F5F5F2] outline-none transition-all placeholder:text-[#8E8E8E] focus:border-[#3ECF8E]/50 focus:bg-[#0A0A0A]"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notification & Settings */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#8E8E8E] transition-all hover:border-white/10 hover:bg-[#111111] hover:text-[#F5F5F2]"
        >
          <Bell className="h-[18px] w-[18px]" />
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#8E8E8E] transition-all hover:border-white/10 hover:bg-[#111111] hover:text-[#F5F5F2]"
        >
          <Settings className="h-[18px] w-[18px]" />
        </motion.button>

        {/* Stellar Network Icon */}
        <button 
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] transition-all duration-200 hover:border-[#3ECF8E] hover:bg-[rgba(255,255,255,0.08)]"
        >
          <Image 
            src="/images/stellar.svg" 
            alt="Stellar" 
            width={20} 
            height={20} 
            className="h-[18px] w-[18px] object-contain brightness-0 invert opacity-90"
          />
        </button>
      </div>
    </motion.header>
  );
}
