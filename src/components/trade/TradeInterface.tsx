'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Info, Loader2, Settings2, Wallet } from 'lucide-react';
import { useTrade, TradeAsset, TradeAction } from '../../hooks/useTrade';
import { useWallet } from '../../hooks/useWallet';

export function TradeInterface() {
  const { isConnected, connect, balances, refreshBalances } = useWallet();
  const { marketData, isLoadingMarket, quote, isQuoting, quoteError, isExecuting, getQuote, executeTrade, refreshMarket } = useTrade();

  const [asset, setAsset] = useState<TradeAsset>('PT');
  const [action, setAction] = useState<TradeAction>('Buy');
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5);

  const STROOP_SCALE = 10000000;

  // Handle amount change and quoting
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      getQuote(action, asset, 0, slippage);
      return;
    }
    const timer = setTimeout(() => {
      getQuote(action, asset, numAmount, slippage);
    }, 400); // Debounce
    return () => clearTimeout(timer);
  }, [amount, action, asset, slippage, getQuote]);

  // Determine which balance to show
  const balanceToDisplay = () => {
    if (action === 'Buy') {
      const b = balances.find(b => b.isNative || b.assetCode === 'XLM');
      return b ? parseFloat(b.amount) : 0;
    } else {
      // Selling PT or YT
      const b = balances.find(b => b.assetCode === asset || b.assetCode.includes(asset));
      // For now, if exact code not found, assume 0
      return b ? parseFloat(b.amount) : 0;
    }
  };

  const currentBalance = balanceToDisplay();

  const handleMax = () => {
    // Leave some XLM for fees if buying
    if (action === 'Buy' && currentBalance > 2) {
      setAmount((currentBalance - 1).toFixed(4));
    } else {
      setAmount(currentBalance.toString());
    }
  };

  const handleSwapExecute = async () => {
    try {
      const result: any = await executeTrade(action, asset, parseFloat(amount), slippage);
      
      console.log('--- Transaction Post-Submission ---');
      console.log('Object returned by signAndSend:', result);
      console.log('Transaction hash:', result?.hash || result?.id || 'Unknown');
      console.log('RPC response:', result);
      console.log('Transaction status:', result?.status || 'Unknown');
      
      if (result && result.status && result.status !== 'SUCCESS') {
        console.error('Contract error:', result);
        alert(`Trade transaction failed on-chain. Status: ${result.status}`);
        return;
      }
      
      // Success flow
      refreshBalances();
      refreshMarket();
      
      // Dispatch global event for Portfolio & Recent Activity to refresh
      window.dispatchEvent(new CustomEvent('nova:refresh'));
      
      alert(`Trade successful! Transaction Hash: ${result?.hash || result?.id || 'Unknown'}`);
      setAmount('');
    } catch (e: any) {
      console.error('Swap Execution Exception:', e);
      alert(`Trade failed: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 max-w-[500px] shadow-2xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#3ECF8E] opacity-[0.03] blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <div className="flex bg-[#111111] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setAction('Buy')}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
              action === 'Buy'
                ? 'bg-[#222222] text-[#F5F5F2] shadow-sm'
                : 'text-[#9A9A9A] hover:text-[#F5F5F2]'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setAction('Sell')}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
              action === 'Sell'
                ? 'bg-[#222222] text-[#F5F5F2] shadow-sm'
                : 'text-[#9A9A9A] hover:text-[#F5F5F2]'
            }`}
          >
            Sell
          </button>
        </div>
        
        <button className="p-2 text-[#9A9A9A] hover:text-[#F5F5F2] transition-colors rounded-xl hover:bg-white/5">
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-1 z-10 relative">
        <div className="flex justify-between text-sm text-[#9A9A9A] mb-1 px-1">
          <span>{action === 'Buy' ? 'You pay' : 'You sell'}</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#F5F5F2] transition-colors" onClick={handleMax}>
            <Wallet className="w-3 h-3" />
            {currentBalance.toFixed(4)} {action === 'Buy' ? 'XLM' : asset}
          </span>
        </div>
        
        <div className="flex items-center bg-[#111111] border border-white/10 rounded-2xl p-4 focus-within:border-[#3ECF8E]/50 transition-colors">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="bg-transparent text-3xl text-[#F5F5F2] font-semibold outline-none w-full placeholder:text-white/20"
          />
          <div className="flex items-center gap-2">
            <button onClick={handleMax} className="text-[10px] uppercase font-bold tracking-wider text-[#3ECF8E] bg-[#3ECF8E]/10 px-2 py-1 rounded-md">
              Max
            </button>
            <div className="flex items-center gap-2 bg-[#222222] border border-white/10 px-3 py-1.5 rounded-xl ml-2">
              <span className="text-sm font-medium text-[#F5F5F2]">{action === 'Buy' ? 'XLM' : asset}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direction Arrow */}
      <div className="flex justify-center -my-3 z-20 relative pointer-events-none">
        <div className="bg-[#1A1A1A] border-4 border-[#0A0A0A] p-2 rounded-xl text-[#9A9A9A]">
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col gap-1 z-10 relative">
        <div className="flex justify-between text-sm text-[#9A9A9A] mb-1 px-1">
          <span>You receive</span>
        </div>
        
        <div className="flex items-center bg-[#111111] border border-white/5 rounded-2xl p-4 opacity-70">
          <div className="text-3xl text-[#F5F5F2] font-semibold w-full overflow-hidden text-ellipsis">
            {isQuoting ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#9A9A9A] mt-2" />
            ) : quote ? (
              quote.expectedOutput.toFixed(4)
            ) : (
              '0.0'
            )}
          </div>
          
          <div className="flex bg-[#222222] border border-white/10 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setAsset('PT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                asset === 'PT' && action === 'Buy'
                  ? 'bg-[#3ECF8E]/20 text-[#3ECF8E]'
                  : (asset === 'PT' ? 'bg-white/10 text-[#F5F5F2]' : 'text-[#9A9A9A] hover:text-[#F5F5F2]')
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setAsset('YT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                asset === 'YT' && action === 'Buy'
                  ? 'bg-[#3ECF8E]/20 text-[#3ECF8E]'
                  : (asset === 'YT' ? 'bg-white/10 text-[#F5F5F2]' : 'text-[#9A9A9A] hover:text-[#F5F5F2]')
              }`}
            >
              YT
            </button>
          </div>
        </div>
      </div>

      {quoteError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {quoteError}
        </div>
      )}

      {/* Trade Info / Slippage */}
      <div className="mt-6 flex flex-col gap-3 px-2 z-10 relative">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#9A9A9A] flex items-center gap-1">Price Impact <Info className="w-3 h-3" /></span>
          <span className={`font-medium ${quote && quote.priceImpact > 2 ? 'text-orange-400' : 'text-[#F5F5F2]'}`}>
            {quote ? `${quote.priceImpact.toFixed(2)}%` : '---'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#9A9A9A] flex items-center gap-1">Minimum Received <Info className="w-3 h-3" /></span>
          <span className="font-medium text-[#F5F5F2]">
            {quote ? `${quote.minimumReceived.toFixed(4)} ${action === 'Buy' ? asset : 'XLM'}` : '---'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#9A9A9A] flex items-center gap-1">Implied Yield <Info className="w-3 h-3" /></span>
          <span className="font-medium text-[#3ECF8E]">
            {marketData ? `${marketData.impliedYield.toFixed(2)}%` : '---'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={!isConnected ? connect : handleSwapExecute}
        disabled={isExecuting || (isConnected && (!quote || !!quoteError))}
        className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-[0_0_20px_rgba(62,207,142,0.1)] hover:shadow-[0_0_30px_rgba(62,207,142,0.2)] disabled:opacity-50 disabled:cursor-not-allowed ${
          !isConnected 
            ? 'bg-[#111111] text-[#F5F5F2] border border-white/10 hover:bg-[#1A1A1A]' 
            : 'bg-[#3ECF8E] text-black hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {!isConnected ? (
          'Connect Wallet'
        ) : isExecuting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Confirming...
          </span>
        ) : quoteError ? (
          'Insufficient Liquidity'
        ) : (
          `${action} ${asset}`
        )}
      </button>
    </div>
  );
}
