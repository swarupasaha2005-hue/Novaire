import React, { useEffect, useState } from 'react';
import { useTrade } from '../../hooks/useTrade';
import { usePortfolio } from '../../hooks/usePortfolio';

export function ProtocolDashboard() {
  const { marketData, isLoadingMarket } = useTrade();
  const { portfolio } = usePortfolio();

  if (isLoadingMarket) {
    return (
      <div className="hidden lg:flex w-[400px] flex-col rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 h-[560px] animate-pulse">
        <h2 className="text-sm font-medium text-[#F5F5F2] mb-6">Market Overview</h2>
        <div className="flex-1 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  if (!marketData) {
    return null;
  }

  const tvl = marketData.ptReserve + marketData.underlyingReserve;

  return (
    <div className="hidden lg:flex w-[400px] flex-col rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 h-[560px] overflow-y-auto">
      <h2 className="text-sm font-medium text-[#F5F5F2] mb-6">Live Protocol Dashboard</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">Current PT Price</span>
          <span className="text-sm font-medium text-white">{marketData.ptPrice.toFixed(4)} XLM</span>
        </div>
        
        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">Current YT Price</span>
          <span className="text-sm font-medium text-white">{marketData.ytPrice.toFixed(4)} XLM</span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">Fixed APY</span>
          <span className="text-sm font-medium text-[#3ECF8E]">{marketData.fixedApy.toFixed(2)}%</span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">TWAP</span>
          <span className="text-sm font-medium text-white">{marketData.twap.toFixed(4)} XLM</span>
        </div>

        <div className="border-t border-white/5 my-2"></div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">PT Reserve</span>
          <span className="text-sm font-medium text-white">{marketData.ptReserve.toLocaleString()} PT</span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">Underlying Reserve</span>
          <span className="text-sm font-medium text-white">{marketData.underlyingReserve.toLocaleString()} XLM</span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">TVL</span>
          <span className="text-sm font-medium text-white">{tvl.toLocaleString()} XLM</span>
        </div>

        <div className="border-t border-white/5 my-2"></div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-white/5">
          <span className="text-sm text-[#9A9A9A]">Current Epoch</span>
          <span className="text-sm font-medium text-white">Epoch 17</span>
        </div>
      </div>
    </div>
  );
}
