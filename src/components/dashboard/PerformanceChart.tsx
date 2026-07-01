'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useYieldPerformance } from '../../hooks/useYieldPerformance';

const FILTERS = ['1D', '7D', '30D', '90D', 'ALL'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Calculate total yield dynamically
    let underlying = 0;
    let pt = 0;
    let yt = 0;
    payload.forEach((p: any) => {
      if (p.dataKey === 'underlying') underlying = p.value;
      if (p.dataKey === 'pt') pt = p.value;
      if (p.dataKey === 'yt') yt = p.value;
    });
    
    const totalYield = pt > 0 || yt > 0 ? (pt + yt) - underlying : 0;
    
    return (
      <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4 shadow-xl">
        <p className="mb-3 text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider">{date}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-8 justify-between">
              <span className="text-[13px] flex items-center gap-2" style={{ color: entry.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="text-[13px] font-medium text-[#F5F5F2]">
                ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {(pt > 0 || yt > 0) && (
            <>
              <div className="my-1 h-[1px] w-full bg-white/10" />
              <div className="flex items-center gap-8 justify-between">
                <span className="text-[13px] font-medium text-[#9A9A9A]">Total Yield</span>
                <span className={`text-[13px] font-medium ${totalYield >= 0 ? 'text-[#3ECF8E]' : 'text-red-400'}`}>
                  {totalYield >= 0 ? '+' : '-'}${Math.abs(totalYield).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceChart() {
  const [activeFilter, setActiveFilter] = useState('30D');
  
  // For demonstration, we assume no yield positions if filter is 1D (to show the empty state toggle)
  const hasYieldPosition = activeFilter !== '1D'; 
  
  const { data, loading } = useYieldPerformance(activeFilter, hasYieldPosition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="flex h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-6 transition-colors hover:border-[#3ECF8E]/50 relative"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 z-10">
        <div>
          <span className="text-[13px] font-medium text-[#9A9A9A]">Yield Position Performance</span>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="font-serif text-[40px] leading-none text-[#F5F5F2] tracking-tight">
              $124,592.80
            </h2>
            <span className="text-sm font-medium text-[#3ECF8E]">+2.4%</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-[#F5F5F2]">
              <div className="h-2 w-2 rounded-full bg-[#E5E7EB]" />
              Underlying
            </div>
            {hasYieldPosition && (
              <>
                <div className="flex items-center gap-1.5 text-[#34D399]">
                  <div className="h-2 w-2 rounded-full bg-[#34D399]" />
                  PT
                </div>
                <div className="flex items-center gap-1.5 text-[#22D3EE]">
                  <div className="h-2 w-2 rounded-full bg-[#22D3EE]" />
                  YT
                </div>
              </>
            )}
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
      </div>

      {/* Chart Area */}
      <div className="relative mt-8 flex-1 w-full min-h-0">
        {!loading && !hasYieldPosition && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="rounded-xl border border-white/5 bg-[#050505]/80 backdrop-blur-sm px-6 py-3 shadow-xl">
              <p className="text-sm font-medium text-[#9A9A9A]">
                Mint your first Yield Position to compare PT and YT performance.
              </p>
            </div>
          </motion.div>
        )}
        
        {loading ? (
          <div className="h-full w-full animate-pulse bg-white/5 rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUnderlying" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E5E7EB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#E5E7EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: '#9A9A9A', fontSize: 11 }}
                dy={10}
                minTickGap={50}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Line 
                type="monotone" 
                dataKey="underlying" 
                name="Underlying Asset"
                stroke="#E5E7EB" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#E5E7EB' }}
                animationDuration={1500}
                isAnimationActive={true}
              />
              {hasYieldPosition && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="pt" 
                    name="Principal Token (PT)"
                    stroke="#34D399" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#34D399' }}
                    animationDuration={1500}
                    isAnimationActive={true}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yt" 
                    name="Yield Token (YT)"
                    stroke="#22D3EE" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#22D3EE' }}
                    animationDuration={1500}
                    isAnimationActive={true}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
