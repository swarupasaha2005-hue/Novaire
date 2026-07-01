"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function NavHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="absolute top-0 left-0 z-50 w-full font-sans bg-transparent border-b border-transparent">
        <div className="max-w-[1440px] mx-auto h-[88px] px-8 md:px-12 xl:px-16 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div className="flex-1 flex items-center z-50">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/logos-v2.png"
                alt="Novaire"
                width={240}
                height={48}
                priority
                className="h-[34px] md:h-[38px] w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <ul className="hidden md:flex items-center justify-center gap-6">
            <Tab>Products</Tab>
            <Tab>How it Works</Tab>
            <Tab>Ecosystem</Tab>
            <Tab>Docs</Tab>
            <Tab>About</Tab>
          </ul>

          {/* Right: Launch App Button & Mobile Toggle */}
          <div className="flex-1 flex items-center justify-end gap-4 z-50">
            <Link
              href="/app"
              className="hidden md:inline-flex items-center justify-center px-6 py-3 rounded-full border border-[rgba(255,255,255,0.12)] bg-transparent text-white text-[14px] font-medium transition-all duration-[250ms] ease-out hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.22)]"
            >
              Launch App ↗
            </Link>

            {/* Hamburger Toggle */}
            <button
              className="md:hidden text-[#F5F5F5] focus:outline-none transition-transform active:scale-95 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[#050505] flex flex-col pt-[100px] px-8 pb-12 font-sans"
          >
            <div className="flex flex-col gap-6 items-start flex-1 overflow-y-auto">
              {['Products', 'How it Works', 'Ecosystem', 'Docs', 'About'].map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 + 0.1, duration: 0.3 }}
                  key={item}
                  className="w-full"
                >
                  <Link
                    href="#"
                    className="text-[#B8B8B8] hover:text-[#F5F5F5] text-[24px] font-medium transition-colors duration-200 block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="w-full mt-auto"
            >
              <Link
                href="/app"
                className="flex items-center justify-center w-full px-6 py-3 rounded-full border border-[rgba(255,255,255,0.12)] bg-transparent text-white text-[16px] font-medium transition-all duration-[250ms] ease-out hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.22)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Launch App ↗
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Tab = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <li className="relative group block cursor-pointer px-[18px] py-[10px] text-[14px] font-medium text-[#B8B8B8] hover:text-white transition-colors duration-300">
      <div className="absolute inset-0 w-full h-full rounded-full border border-transparent opacity-0 scale-[0.97] transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:bg-[#0F5E3A]/80 group-hover:border-[#3ECF8E]/20 pointer-events-none backdrop-blur-[8px]" />
      <span className="relative z-10">{children}</span>
    </li>
  );
};
