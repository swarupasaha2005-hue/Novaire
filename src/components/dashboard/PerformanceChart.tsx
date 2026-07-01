'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const FILTERS = ['1D', '7D', '30D', '90D', 'ALL'];

export function PerformanceChart() {
  const [activeFilter, setActiveFilter] = useState('30D');

  // Simple SVG path for the chart line (mock data)
  const linePath = "M0,150 C50,140 100,160 150,130 C200,100 250,120 300,90 C350,60 400,110 450,70 C500,30 550,50 600,20 C650,-10 700,30 750,10 L800,0";
  const areaPath = `${linePath} L800,200 L0,200 Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="flex h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-6 transition-colors hover:border-[#3ECF8E]/50"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <span className="text-[13px] font-medium text-[#9A9A9A]">Portfolio Performance</span>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="font-serif text-[40px] leading-none text-[#F5F5F2] tracking-tight">
              $124,592.80
            </h2>
            <span className="text-sm font-medium text-[#3ECF8E]">+2.4%</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex rounded-lg border border-white/10 bg-[#050505] p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[#111111] text-[#F5F5F2] shadow-sm'
                  : 'text-[#9A9A9A] hover:text-[#F5F5F2]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative mt-8 flex-1 w-full">
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ECF8E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3ECF8E" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid Lines */}
          <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Area Fill */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            d={areaPath}
            fill="url(#chart-area)"
          />
          
          {/* Stroke Line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            d={linePath}
            fill="none"
            stroke="#3ECF8E"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[11px] font-medium text-[#9A9A9A]">
          <span>May 1</span>
          <span>May 8</span>
          <span>May 15</span>
          <span>May 22</span>
          <span>May 30</span>
        </div>
      </div>
    </motion.div>
  );
}
