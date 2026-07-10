'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Info, Loader2, Settings2, Wallet } from 'lucide-react';
import { useTrade, TradeAsset, TradeAction } from '../../hooks/useTrade';
import { useWallet } from '../../hooks/useWallet';
import { NotificationService } from '../../services/notificationService';

export function TradeInterface() {
  const { isConnected, connect, balances, refreshBalances } = useWallet();
  const { marketData, isLoadingMarket, quote, isQuoting, quoteError, isExecuting, getQuote, executeTrade, refreshMarket } = useTrade();

  const [asset, setAsset] = useState<TradeAsset>('PT');
  const [action, setAction] = useState<TradeAction>('Buy');
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5);

  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

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
        NotificationService.addNotification('network', 'Trade Failed', `Trade transaction failed on-chain. Status: ${result.status}`);
        return;
      }
      
      // Success flow
      refreshBalances();
      refreshMarket();
      
      // Dispatch global event for Portfolio & Recent Activity to refresh
      window.dispatchEvent(new CustomEvent('nova:refresh'));
      
      NotificationService.addNotification('transaction', 'Trade Successful', `Successfully executed ${action} for ${amount} ${action === 'Buy' ? 'XLM' : asset}.`);
      setAmount('');
    } catch (e: any) {
      console.error('Swap Execution Exception:', e);
      NotificationService.addNotification('transaction', 'Trade Failed', e.message || 'Failed to execute trade.');
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-2xl border border-nova-border bg-nova-surface p-6 shadow-2xl relative overflow-hidden transition-all duration-200 hover:border-[#3ECF8E]/50 hover:shadow-[0_0_20px_rgba(62,207,142,0.15)] hover:-translate-y-[3px]">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#3ECF8E] opacity-[0.03] blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <div className="flex bg-nova-surface border border-nova-border p-1 rounded-xl">
          <button
            onClick={() => setAction('Buy')}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
              action === 'Buy'
                ? 'bg-nova-surface-hover text-nova-text shadow-sm'
                : 'text-nova-muted hover:text-nova-text'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setAction('Sell')}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
              action === 'Sell'
                ? 'bg-nova-surface-hover text-nova-text shadow-sm'
                : 'text-nova-muted hover:text-nova-text'
            }`}
          >
            Sell
          </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowSlippageSettings(!showSlippageSettings)}
            className={`p-2 transition-colors rounded-xl ${showSlippageSettings ? 'bg-white/10 text-nova-text' : 'text-nova-muted hover:text-nova-text hover:bg-white/5'}`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
          
          {/* Local Slippage Dropdown */}
          {showSlippageSettings && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-white/10 bg-[#111111] p-4 shadow-2xl">
              <h3 className="mb-3 text-sm font-medium text-white">Slippage Tolerance</h3>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map(val => (
                  <button
                    key={val}
                    onClick={() => { setSlippage(val); setShowSlippageSettings(false); }}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      slippage === val ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-1 z-10 relative">
        <div className="flex justify-between text-sm text-nova-muted mb-1 px-1">
          <span>{action === 'Buy' ? 'You pay' : 'You sell'}</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-nova-text transition-colors" onClick={handleMax}>
            <Wallet className="w-3 h-3" />
            {currentBalance.toFixed(4)} {action === 'Buy' ? 'XLM' : asset}
          </span>
        </div>
        
        <div className="flex items-center bg-nova-surface border border-nova-border rounded-2xl p-4 focus-within:border-nova-accent/50 transition-colors">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="bg-transparent text-3xl text-nova-text font-semibold outline-none w-full placeholder:text-white/20"
          />
          <div className="flex items-center gap-2">
            <button onClick={handleMax} className="text-[10px] uppercase font-bold tracking-wider text-[#3ECF8E] bg-[#3ECF8E]/10 px-2 py-1 rounded-md">
              Max
            </button>
            <div className="flex items-center gap-2 bg-nova-surface-hover border border-nova-border px-3 py-1.5 rounded-xl ml-2">
              <span className="text-sm font-medium text-nova-text">{action === 'Buy' ? 'XLM' : asset}</span>
            </div>
          </div>
        </div>
      </div>



      {/* Output Section */}
      <div className="flex flex-col gap-1 z-10 relative">
        <div className="flex justify-between text-sm text-nova-muted mb-1 px-1">
          <span>You receive</span>
        </div>
        
        <div className="flex items-center bg-nova-surface border border-nova-border rounded-2xl p-4 opacity-70">
          <div className="text-3xl text-nova-text font-semibold w-full overflow-hidden text-ellipsis">
            {isQuoting ? (
              <Loader2 className="w-6 h-6 animate-spin text-nova-muted mt-2" />
            ) : quote ? (
              quote.expectedOutput.toFixed(4)
            ) : (
              '0.0'
            )}
          </div>
          
          <div className="flex bg-nova-surface-hover border border-nova-border p-1 rounded-xl shrink-0">
            <button
              onClick={() => setAsset('PT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                asset === 'PT' && action === 'Buy'
                  ? 'bg-[#3ECF8E]/20 text-[#3ECF8E]'
                  : (asset === 'PT' ? 'bg-white/10 text-nova-text' : 'text-nova-muted hover:text-nova-text')
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setAsset('YT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                asset === 'YT' && action === 'Buy'
                  ? 'bg-[#3ECF8E]/20 text-[#3ECF8E]'
                  : (asset === 'YT' ? 'bg-white/10 text-nova-text' : 'text-nova-muted hover:text-nova-text')
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
          <span className="text-nova-muted flex items-center gap-1">Price Impact <Info className="w-3 h-3" /></span>
          <span className={`font-medium ${quote && Math.abs(quote.priceImpact) > 2 ? 'text-orange-400' : 'text-nova-text'}`}>
            {quote ? `${quote.priceImpact.toFixed(2)}%` : '---'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-nova-muted flex items-center gap-1">Minimum Received <Info className="w-3 h-3" /></span>
          <span className="font-medium text-nova-text">
            {quote ? `${quote.minimumReceived.toFixed(4)} ${action === 'Buy' ? asset : 'XLM'}` : '---'}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-nova-muted flex items-center gap-1">Implied Yield <Info className="w-3 h-3" /></span>
          <span className="font-medium text-[#3ECF8E]">
            {marketData ? `${marketData.impliedYield.toFixed(2)}%` : '---'}
          </span>
        </div>
      </div>

      <button
        onClick={!isConnected ? connect : handleSwapExecute}
        disabled={isExecuting || (isConnected && (!quote || !!quoteError))}
        className={`mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          !isConnected 
            ? 'bg-nova-surface text-nova-text border border-nova-border hover:bg-nova-surface-hover hover:-translate-y-[1px]' 
            : 'bg-[#3ECF8E] text-black hover:brightness-110 hover:-translate-y-[1px] active:scale-[0.98]'
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
