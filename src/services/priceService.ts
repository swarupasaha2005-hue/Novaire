import { PriceData } from '../types';

export interface CoinDcxTicker {
  market: string;
  change_24_hour: string;
  high: string;
  low: string;
  volume: string;
  last_price: string;
  bid: string;
  ask: string;
  timestamp: number;
}

export class PriceService {
  private static CACHE_KEY = 'novaire_coindcx_ticker_cache';
  private static CACHE_DURATION_MS = 10000; // 10 seconds cache
  private static MAX_RETRIES = 3;

  private static cachedData: CoinDcxTicker[] | null = null;
  private static cacheTimestamp: number = 0;

  /**
   * Internal method to fetch with retries
   */
  private static async fetchWithRetry(url: string, retries = this.MAX_RETRIES): Promise<any> {
    console.log("1. Sending request to CoinDCX API:", url);
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        console.log(`2. Response status (Attempt ${i + 1}):`, response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
           console.log("3. First 5 objects returned:", data.slice(0, 5));
        } else {
           console.log("3. Raw data returned:", data);
        }
        return data;
      } catch (error: any) {
        console.error(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) {
           console.error("4. All retries failed. Final error:", error.message);
           throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  /**
   * Fetch all ticker data from CoinDCX with in-memory caching
   */
  static async getTicker(): Promise<CoinDcxTicker[]> {
    const now = Date.now();
    
    if (this.cachedData && (now - this.cacheTimestamp < this.CACHE_DURATION_MS)) {
      return this.cachedData;
    }

    try {
      const data = await this.fetchWithRetry('/api/prices');
      this.cachedData = data;
      this.cacheTimestamp = now;
      return data;
    } catch (error) {
      console.error('Failed to fetch CoinDCX ticker:', error);
      // Fallback to stale cache if available
      if (this.cachedData) return this.cachedData;
      throw error;
    }
  }

  /**
   * Get all markets (just mapping the ticker data for now)
   */
  static async getMarkets(): Promise<string[]> {
    const tickers = await this.getTicker();
    return tickers.map(t => t.market);
  }

  /**
   * Get formatted PriceData for a specific symbol (e.g. 'BTC' resolves to 'BTCUSDT')
   */
  static async getAssetPrice(symbol: string): Promise<PriceData | null> {
    const tickers = await this.getTicker();
    
    // Attempt to find the USDT pair for the asset
    const targetMarket = `${symbol.toUpperCase()}USDT`;
    const ticker = tickers.find(t => t.market === targetMarket);

    if (!ticker) return null;

    const currentPrice = parseFloat(ticker.last_price);
    const low = parseFloat(ticker.low);
    const high = parseFloat(ticker.high);

    return {
      asset: symbol.toUpperCase(),
      priceUsd: currentPrice,
      change24h: parseFloat(ticker.change_24_hour),
      // Mocking sparkline data since CoinDCX ticker doesn't provide historical arrays
      sparkline: [
        low, 
        currentPrice - ((currentPrice - low) * 0.5), 
        currentPrice, 
        high, 
        currentPrice + ((high - currentPrice) * 0.2), 
        currentPrice
      ]
    };
  }

  /**
   * Get historical prices (Mock implementation as CoinDCX historical API requires specific auth/pairs)
   */
  static async getHistoricalPrices(symbol: string): Promise<number[]> {
    const priceData = await this.getAssetPrice(symbol);
    return priceData?.sparkline || [];
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  static async getXLMPrice(): Promise<PriceData | null> {
    return this.getAssetPrice('XLM');
  }

  static async getBTCPrice(): Promise<PriceData | null> {
    return this.getAssetPrice('BTC');
  }

  static async getETHPrice(): Promise<PriceData | null> {
    return this.getAssetPrice('ETH');
  }

  /**
   * Get all prices to fulfill the usePrices hook
   */
  static async getPrices(): Promise<PriceData[]> {
    const assets = ['USDC', 'XLM', 'BTC', 'ETH', 'SOL', 'USDT'];
    const results = await Promise.all(
      assets.map(asset => this.getAssetPrice(asset))
    );
    
    return results.filter((p): p is PriceData => p !== null);
  }
}
