'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRight, Loader2, AlertCircle, CheckCircle2, TrendingUp, Zap, Sliders } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { signTransaction } from '@stellar/freighter-api';
import { YieldService } from '../../services/yieldService';
import { CONTRACTS, RPC_URL, NETWORK_PASSPHRASE } from '../../config/contracts';

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAsset?: string;
  onSuccess?: () => void;
}

type YieldPreference = 'fixed' | 'keep' | 'custom';

export function MintModal({ isOpen, onClose, defaultAsset = 'XLM', onSuccess }: MintModalProps) {
  const { isConnected, address, connect, balances, refreshBalances } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [vaults, setVaults] = useState<any[]>([]);
  const [selectedVault, setSelectedVault] = useState<string>('');

  // Yield Preference state
  const [yieldPreference, setYieldPreference] = useState<YieldPreference>('fixed');
  const [customYtPct, setCustomYtPct] = useState<string>('50');

  const [step, setStep] = useState<'idle' | 'simulating' | 'signing' | 'broadcasting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    async function loadVaults() {
      try {
        const v = await YieldService.getVaults();
        setVaults(v);

        if (v.length > 0) {
          let defaultVaultId = v[0].id;

          if (balances && balances.length > 0) {
            const hasXlm = balances.some(b => b.assetCode === 'XLM' && parseFloat(b.amount) > 0);
            const hasUsdc = balances.some(b => b.assetCode === 'USDC' && parseFloat(b.amount) > 0);

            if (hasXlm && !hasUsdc) {
              const xlmVault = v.find(vault => vault.asset === 'XLM');
              if (xlmVault) defaultVaultId = xlmVault.id;
            }
          }

          setSelectedVault(defaultVaultId);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (isOpen) loadVaults();
  }, [isOpen, balances]);

  const activeVault = vaults.find(v => v.id === selectedVault);
  const availableAssets = activeVault ? (Array.isArray(activeVault.asset) ? activeVault.asset : [activeVault.asset]) : [defaultAsset];
  const [currentAsset, setCurrentAsset] = useState<string>(availableAssets[0]);

  useEffect(() => {
    if (activeVault) {
      const assets = Array.isArray(activeVault.asset) ? activeVault.asset : [activeVault.asset];
      if (!assets.includes(currentAsset)) setCurrentAsset(assets[0]);
    }
  }, [activeVault]);

  useEffect(() => {
    if (isConnected && address) {
      const b = balances?.find(b => b.assetCode === currentAsset);
      setBalance(b ? parseFloat(b.amount) : 0);
    } else {
      setBalance(0);
    }
  }, [isConnected, address, isOpen, currentAsset, balances]);

  const parsedAmount = parseFloat(amount) || 0;
  const isInvalidAmount = parsedAmount <= 0 || isNaN(parsedAmount);
  const isInsufficientBalance = parsedAmount > balance;

  const ptEstimate = parsedAmount * 1.0;
  const ytEstimate = parsedAmount * 1.0;
  const fixedApy = activeVault ? activeVault.fixedApy : 0;
  const maturityDate = activeVault ? new Date(activeVault.maturityDate).toLocaleDateString() : '-';
  const estimatedRedemption = parsedAmount * (1 + (fixedApy / 100) * (30 / 365));

  // Compute yt_sale_percentage
  const ytSalePercentage: number = (() => {
    if (yieldPreference === 'fixed') return 100;
    if (yieldPreference === 'keep') return 0;
    const pct = parseInt(customYtPct, 10);
    if (isNaN(pct)) return 0;
    return Math.max(0, Math.min(100, pct));
  })();

  const ytToSell = ytEstimate * (ytSalePercentage / 100);
  const ytToKeep = ytEstimate - ytToSell;

  const handleMax = () => setAmount(balance.toString());

  const handleMint = async () => {
    if (!isConnected) return connect();
    if (isInvalidAmount || isInsufficientBalance) return;

    setStep('simulating');
    try {
      const { Client } = await import('../../../packages/bindings/intent_engine/src/index');
      const { rpc } = await import('@stellar/stellar-sdk');

      const server = new rpc.Server(RPC_URL, { allowHttp: true });
      const latestLedger = await server.getLatestLedger();
      const maturityLedger = latestLedger.sequence + 50000;

      const client = new Client({
        contractId: CONTRACTS.INTENT_ENGINE,
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
        publicKey: address!,
      });

      const amountStroops = BigInt(Math.floor(parsedAmount * 10_000_000));
      const minImpliedRate = BigInt(0);

      // ─── Diagnostic Logging ─────────────────────────────────────────
      console.groupCollapsed('[Novaire:Mint] Yield Preference Diagnostic');
      console.log('Selected yield mode     :', yieldPreference);
      console.log('yt_sale_percentage      :', ytSalePercentage, '% (0=keep all, 100=sell all)');
      console.log('YT to sell (estimated)  :', ytToSell.toFixed(4));
      console.log('YT to keep (estimated)  :', ytToKeep.toFixed(4));
      console.log('swap_yt_for_underlying  :', ytSalePercentage > 0 ? 'WILL BE CALLED' : 'WILL NOT BE CALLED');
      console.log('Target intent_engine ID :', CONTRACTS.INTENT_ENGINE);
      console.log('Full call args:', {
        user: address,
        usdc_amount: amountStroops.toString(),
        min_implied_rate: minImpliedRate.toString(),
        _maturity_ledger: maturityLedger,
        yt_sale_percentage: ytSalePercentage,
      });
      console.groupEnd();
      // ────────────────────────────────────────────────────────────────

      setStep('signing');
      const tx = await client.execute_fixed_yield_intent({
        user: address!,
        usdc_amount: amountStroops,
        min_implied_rate: minImpliedRate,
        _maturity_ledger: maturityLedger,
        yt_sale_percentage: ytSalePercentage,
      });

      setStep('broadcasting');
      const result = await tx.signAndSend({ signTransaction });

      if (result) {
        setStep('success');
      } else {
        throw new Error('Transaction failed on-chain');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Transaction failed');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      refreshBalances?.();
      onSuccess?.();
    }
    setStep('idle');
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  const preferenceOptions: { key: YieldPreference; icon: React.ReactNode; title: string; badge?: string; description: string; bullets: string[] }[] = [
    {
      key: 'fixed',
      icon: <TrendingUp className="h-4 w-4" />,
      title: 'Fixed Yield',
      badge: 'Recommended',
      description: 'Automatically sell 100% of minted YT',
      bullets: ['Receive XLM immediately from YT sale', 'Hold only PT until maturity', 'Best for predictable fixed returns'],
    },
    {
      key: 'keep',
      icon: <Zap className="h-4 w-4" />,
      title: 'Keep All YT',
      description: 'Receive both PT and YT tokens',
      bullets: ['No automatic YT sale', 'Trade or automate YT later', 'Speculate on variable yield'],
    },
    {
      key: 'custom',
      icon: <Sliders className="h-4 w-4" />,
      title: 'Custom Split',
      description: 'Choose how much YT to sell',
      bullets: ['Partial fixed + partial variable yield', 'Fine-tune your risk/reward profile'],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-5 shrink-0">
            <h2 className="text-xl font-semibold text-[#F5F5F2]">Mint PT &amp; YT</h2>
            <button onClick={handleClose} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto">

            {step === 'idle' || step === 'error' ? (
              <>
                {/* Wallet Info */}
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-[#3ECF8E]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-white/50">Connected</span>
                      <span className="text-sm font-medium text-white">
                        {isConnected && address ? `${address.slice(0, 5)}...${address.slice(-4)}` : 'Not Connected'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-white/50">Balance</span>
                    <span className="text-sm font-medium text-white">{balance.toFixed(4)} {currentAsset}</span>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60">Select Vault</label>
                    <select
                      value={selectedVault}
                      onChange={(e) => setSelectedVault(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm text-white focus:border-[#3ECF8E] focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                    >
                      {vaults.map(v => {
                        const assetName = Array.isArray(v.asset) ? v.asset.join('/') : v.asset;
                        return (
                          <option key={v.id} value={v.id}>{v.protocol} {assetName} Vault - {v.fixedApy}% APY</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white/60">Amount to Deposit</label>
                      <button onClick={handleMax} className="text-xs text-[#3ECF8E] hover:underline">Max</button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-black p-3 pr-24 text-lg text-white focus:border-[#3ECF8E] focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        {availableAssets.length > 1 ? (
                          <select
                            value={currentAsset}
                            onChange={(e) => setCurrentAsset(e.target.value)}
                            className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white outline-none cursor-pointer hover:bg-white/20 transition-colors"
                          >
                            {availableAssets.map((asset: string) => (
                              <option key={asset} value={asset} className="bg-black text-white">{asset}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white cursor-not-allowed opacity-80">
                            {currentAsset}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Yield Preference ── */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Yield Preference</p>
                    <p className="text-xs text-white/50 mt-0.5">Choose how your Yield Tokens (YT) are handled after minting.</p>
                  </div>

                  <div className="space-y-2">
                    {preferenceOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setYieldPreference(opt.key)}
                        className={`w-full text-left rounded-xl border p-4 transition-all duration-150 ${
                          yieldPreference === opt.key
                            ? 'border-[#3ECF8E]/60 bg-[#3ECF8E]/8'
                            : 'border-white/8 bg-white/3 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio */}
                          <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            yieldPreference === opt.key ? 'border-[#3ECF8E]' : 'border-white/30'
                          }`}>
                            {yieldPreference === opt.key && (
                              <div className="h-2 w-2 rounded-full bg-[#3ECF8E]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium flex items-center gap-1.5 ${yieldPreference === opt.key ? 'text-white' : 'text-white/70'}`}>
                                <span className={yieldPreference === opt.key ? 'text-[#3ECF8E]' : 'text-white/40'}>{opt.icon}</span>
                                {opt.title}
                              </span>
                              {opt.badge && (
                                <span className="rounded-full bg-[#3ECF8E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#3ECF8E]">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50 mt-0.5">{opt.description}</p>
                            {yieldPreference === opt.key && (
                              <ul className="mt-2 space-y-1">
                                {opt.bullets.map((b, i) => (
                                  <li key={i} className="flex items-center gap-1.5 text-xs text-white/60">
                                    <span className="h-1 w-1 rounded-full bg-[#3ECF8E]/60 shrink-0" />
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {/* Custom split input */}
                            {yieldPreference === 'custom' && opt.key === 'custom' && (
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-white/50">Sell</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={customYtPct}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setCustomYtPct(e.target.value)}
                                  className="w-16 rounded-lg border border-white/10 bg-black px-2 py-1 text-center text-sm text-white focus:border-[#3ECF8E] focus:outline-none"
                                />
                                <span className="text-xs text-white/50">% of YT immediately</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="rounded-xl border border-[#3ECF8E]/20 bg-[#3ECF8E]/5 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">You receive PT</span>
                    <span className="text-sm font-medium text-white">{ptEstimate.toFixed(4)}</span>
                  </div>
                  {ytToKeep > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">You receive YT</span>
                      <span className="text-sm font-medium text-white">{ytToKeep.toFixed(4)}</span>
                    </div>
                  )}
                  {ytToSell > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">YT sold for {currentAsset}</span>
                      <span className="text-sm font-medium text-[#3ECF8E]">~{ytToSell.toFixed(4)} YT → {currentAsset}</span>
                    </div>
                  )}
                  <div className="h-px w-full bg-[#3ECF8E]/20" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Fixed APY</span>
                    <span className="text-sm font-medium text-[#3ECF8E]">{fixedApy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Maturity Date</span>
                    <span className="text-sm font-medium text-white">{maturityDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">PT Redemption Value</span>
                    <span className="text-sm font-medium text-[#3ECF8E]">{estimatedRedemption.toFixed(4)} {currentAsset}</span>
                  </div>
                </div>

                {step === 'error' && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </>
            ) : step === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3ECF8E]/20">
                  <CheckCircle2 className="h-8 w-8 text-[#3ECF8E]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">Mint Successful</h3>
                  <p className="text-sm text-white/60">
                    {yieldPreference === 'fixed' && `You received ${ptEstimate.toFixed(2)} PT. Your YT was automatically sold for ${currentAsset}.`}
                    {yieldPreference === 'keep' && `You received ${ptEstimate.toFixed(2)} PT and ${ytEstimate.toFixed(2)} YT.`}
                    {yieldPreference === 'custom' && `You received ${ptEstimate.toFixed(2)} PT, ${ytToKeep.toFixed(2)} YT, and sold ${ytToSell.toFixed(2)} YT for ${currentAsset}.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <Loader2 className="h-10 w-10 animate-spin text-[#3ECF8E]" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    {step === 'simulating' && 'Simulating Transaction'}
                    {step === 'signing' && 'Awaiting Signature'}
                    {step === 'broadcasting' && 'Broadcasting to Stellar Network'}
                  </h3>
                  <p className="text-sm text-white/60">
                    {step === 'simulating' && 'Checking parameters against on-chain state...'}
                    {step === 'signing' && 'Please sign the transaction in your Freighter wallet.'}
                    {step === 'broadcasting' && 'Waiting for ledger confirmation...'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            {(step === 'idle' || step === 'error') && (
              <button
                onClick={handleMint}
                disabled={isConnected && (isInvalidAmount || isInsufficientBalance || !activeVault)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3ECF8E] py-4 font-semibold text-black hover:bg-[#3ECF8E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isConnected ? 'Connect Wallet' : isInvalidAmount ? 'Enter Amount' : isInsufficientBalance ? 'Insufficient Balance' : 'Mint PT & YT'}
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            {step === 'success' && (
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3ECF8E] py-4 font-semibold text-black hover:bg-[#3ECF8E]/90 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
