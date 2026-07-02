import { useState, useEffect, useCallback } from 'react';
import { PortfolioService, PortfolioSummary } from '../services/portfolioService';
import { WalletService } from '../services/walletService';

export interface UsePortfolioResult {
  portfolio: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// ─── Global State for Single Source of Truth ──────────────────────
let globalPortfolio: PortfolioSummary | null = null;
let globalLoading: boolean = true;
let globalError: string | null = null;
let listeners: Array<() => void> = [];
let isInitialized = false;
let isFetching = false;

const notifyListeners = () => {
  console.log(`[usePortfolio] Notifying ${listeners.length} listeners. globalLoading=${globalLoading}`);
  listeners.forEach((listener) => listener());
};

const fetchGlobalPortfolio = async () => {
  if (isFetching) {
    console.log("[usePortfolio] fetchGlobalPortfolio skipped (already fetching)");
    return;
  }
  console.log("[usePortfolio] Fetching Portfolio...");
  isFetching = true;
  globalLoading = true;
  globalError = null;
  notifyListeners();
  
  try {
    const data = await PortfolioService.getPortfolio();
    console.log("[usePortfolio] Portfolio fetched:", data);
    if (data.error) {
      globalError = data.error;
    }
    
    // Attach a random ID to verify object identity across components
    if (data && !data._instanceId) {
      (data as any)._instanceId = Math.random().toString(36).substring(7);
    }
    globalPortfolio = data;
  } catch (err: any) {
    console.error("[usePortfolio] Fetch Error:", err);
    globalError = err.message || 'An unexpected error occurred while fetching the portfolio';
  } finally {
    globalLoading = false;
    isFetching = false;
    notifyListeners();
  }
};
// ──────────────────────────────────────────────────────────────────

export const usePortfolio = (): UsePortfolioResult => {
  // Use a simple tick to force re-render when global state changes
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);

    if (!isInitialized) {
      isInitialized = true;
      fetchGlobalPortfolio();

      // Extensibility: Re-fetch on wallet connection change
      WalletService.onConnectionChange(() => {
        fetchGlobalPortfolio();
      });
    }

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  console.log(`[usePortfolio hook return] loading=${globalLoading}, instanceId=${(globalPortfolio as any)?._instanceId}`);
  
  return {
    portfolio: globalPortfolio,
    loading: globalLoading,
    error: globalError,
    refresh: fetchGlobalPortfolio,
  };
};
