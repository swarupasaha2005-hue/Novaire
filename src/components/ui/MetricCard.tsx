'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  change?: React.ReactNode;
  isPositive?: boolean;
  icon: React.ElementType;
  sparkline?: string;
  index?: number;
  delay?: number;
}

export function MetricCard({ 
  label, 
  value, 
  change, 
  isPositive = true, 
  icon: Icon, 
  sparkline,
  index = 0,
  delay = 0.2
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay + index * 0.05, ease: 'easeOut' }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#111111] p-4 transition-all duration-200 hover:border-[#43D18C] hover:shadow-[0_0_18px_rgba(67,209,140,0.15)] hover:-translate-y-[3px]"
    >
      {/* Top Row: Icon & Label */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#9A9A9A] transition-colors duration-200 group-hover:bg-[#43D18C]/10 group-hover:text-[#43D18C]">
          <Icon className="h-3 w-3" />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#9A9A9A] font-sans leading-none">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="mt-3 flex flex-col relative z-10 min-h-[28px]">
        <div className="font-serif text-[22px] leading-tight text-[#F5F5F2] tracking-tight">
          {value}
        </div>
        {change && (
          <div className={`mt-1 text-[10px] font-medium font-sans ${isPositive ? 'text-[#43D18C]' : 'text-red-400'}`}>
            {change}
          </div>
        )}
      </div>

      {/* Bottom accent line — always visible, brightens on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#43D18C]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Sparkline */}
      {sparkline && (
        <div className="absolute -bottom-1 left-0 right-0 h-7 opacity-20 transition-opacity duration-200 group-hover:opacity-60 z-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 50 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sg-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#43D18C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#43D18C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={sparkline}
              fill="none"
              stroke="#43D18C"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`${sparkline} L50,20 L0,20 Z`}
              fill={`url(#sg-${label.replace(/\s/g, '')})`}
              stroke="none"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
