import { useState, useEffect, useCallback } from 'react';
import { PortfolioService, PortfolioSummary } from '../services/portfolioService';
import { WalletService } from '../services/walletService';

export interface UsePortfolioResult {
  portfolio: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePortfolio = (): UsePortfolioResult => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PortfolioService.getPortfolio();
      
      // Inherit logical errors from the service layer, but still update state
      if (data.error) {
        setError(data.error);
      }
      
      setPortfolio(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching the portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    
    // Future Extensibility: 
    // This is where event listeners (e.g., wallet connection changes, 
    // WebSocket yield updates, or PT/YT contract events) will be attached
    // to automatically trigger `fetchPortfolio()` without changing the UI API.

    const unsubscribeWallet = WalletService.onConnectionChange(() => {
      fetchPortfolio();
    });

    return () => { 
      unsubscribeWallet();
    };
  }, [fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    refresh: fetchPortfolio
  };
};
