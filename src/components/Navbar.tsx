"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
      px-5 sm:px-8 lg:px-12
      py-4 sm:py-5 lg:py-6
      backdrop-blur-md bg-nova-bg/50 border-b border-white/[0.02]">

      {/* BRAND */}
      <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
          bg-nova-surface border border-nova-border
          transition-all duration-300
          group-hover:border-white/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]
          relative overflow-hidden shrink-0">
          <Image src="/logo.png" alt="Novaire Logo" fill sizes="40px" className="object-cover" />
        </div>
        <span className="font-serif text-lg sm:text-xl tracking-wide text-nova-text">
          Novaire
        </span>
      </Link>

      {/* LINKS */}
      <div className="flex items-center">
        <a
          href="https://x.com/NovaireFi"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center
            px-4 sm:px-5 py-2 sm:py-2.5
            rounded-full border border-nova-border bg-nova-surface
            text-nova-text text-xs sm:text-sm font-medium
            hover:bg-nova-bg transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <span className="relative flex items-center whitespace-nowrap">
            Follow on X
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1.5 sm:ml-2 text-nova-muted
              group-hover:text-nova-text transition-colors" />
          </span>
        </a>
      </div>
    </nav>
  );
}
