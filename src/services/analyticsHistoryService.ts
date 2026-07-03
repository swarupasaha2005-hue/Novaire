import { PortfolioService } from './portfolioService';
import { YieldService } from './yieldService';
import { PriceOracleService } from './priceOracleService';
import { ProtocolService } from './protocolService';

export interface AnalyticsSnapshot {
  timestamp: number;
  portfolioValue: number;
  yieldPositionValue: number;
  ptPrice: number;
  ytPrice: number;
  fixedApy: number;
  tvl: number;
  volume: number;
}

export class AnalyticsHistoryService {
  private static STORAGE_KEY = 'novaire_analytics_history';
  
  private static snapshots: AnalyticsSnapshot[] = [];
  private static listeners: Array<(snapshots: AnalyticsSnapshot[]) => void> = [];
  private static pollInterval: ReturnType<typeof setInterval> | null = null;
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  static subscribe(listener: (snapshots: AnalyticsSnapshot[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  static getSnapshots() {
    return this.snapshots;
  }

  static startPolling(intervalMs = 10000) { // 10s is sufficient for API polling
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      await this.syncAndFetch();
    }, intervalMs);
    
    // Initial fetch
    this.syncAndFetch();
  }

  static stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  static async syncAndFetch() {
    try {
      // 1. Trigger the sync API to process any new on-chain events
      await fetch('/api/history/sync').catch(() => null);

      // 2. Fetch the persisted protocol history
      const res = await fetch('/api/history');
      if (!res.ok) return;
      const history = await res.json();

      if (!Array.isArray(history) || history.length === 0) return;

      // 3. Fetch user's current holdings
      const [portfolio, vaults, prices] = await Promise.all([
        PortfolioService.getPortfolio().catch(() => null),
        YieldService.getVaults().catch(() => null),
        PriceOracleService.getPrices().catch(() => null)
      ]);

      if (!portfolio || portfolio.error || !portfolio.assets || !prices) {
        // Retain previous sample and don't clear history if fetch fails
        return;
      }

      const xlmPriceRaw = prices?.find((p: any) => p.asset === 'XLM')?.priceUsd;
      const xlmPrice = (typeof xlmPriceRaw === 'number' && !isNaN(xlmPriceRaw)) ? xlmPriceRaw : 0.1;

      // Calculate base static balances
      let ptBalance = 0;
      let ytBalance = 0;
      let claimableYield = 0;
      let nonYieldPortfolioValue = 0;

      portfolio.assets.forEach((a: any) => {
        if (a.assetType === 'pt') ptBalance += Number(a.balance) || 0;
        else if (a.assetType === 'yt') ytBalance += Number(a.balance) || 0;
        else if (a.valueUsd) nonYieldPortfolioValue += Number(a.valueUsd);
      });
      
      if (portfolio.metrics?.totalClaimableYieldUsd) {
        claimableYield = portfolio.metrics.totalClaimableYieldUsd;
      }

      // 4. Map the global protocol history into user-specific AnalyticsSnapshots
      this.snapshots = history.map((h: any) => {
        // h.ptPrice is the underlying price in XLM from the smart contract
        // Convert to USD using the current XLM price
        const ptPriceUsd = h.ptPrice * xlmPrice;
        const ytPriceUsd = h.ytPrice * xlmPrice;

        const ptPositionValue = ptBalance * ptPriceUsd;
        const ytPositionValue = ytBalance * ytPriceUsd;
        const yieldPositionValue = ptPositionValue + ytPositionValue + claimableYield;
        const totalPortfolioValue = nonYieldPortfolioValue + yieldPositionValue;

        return {
          timestamp: new Date(h.timestamp).getTime(),
          portfolioValue: totalPortfolioValue,
          yieldPositionValue: yieldPositionValue,
          ptPrice: ptPriceUsd,
          ytPrice: ytPriceUsd,
          fixedApy: h.fixedApy,
          tvl: h.tvl,
          volume: h.tradingVolume
        };
      });

      this.listeners.forEach((l) => l([...this.snapshots]));
    } catch (error) {
      console.error("Error syncing analytics history:", error);
    }
  }
}
