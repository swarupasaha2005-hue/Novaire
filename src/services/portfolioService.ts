import { WalletService, WalletAssetBalance } from './walletService';
import { PriceService } from './priceService';
import { MarketService } from './marketService';

export interface PortfolioAsset {
  assetCode: string;
  issuer: string | null;
  balance: number;
  priceUsd: number;
  valueUsd: number;
  allocationPercent: number;
  isNative: boolean;
  // Extensibility hooks for future types of balances
  assetType: 'wallet' | 'pt' | 'yt' | 'vault' | 'yield';
}

export interface PortfolioAllocation {
  assetCode: string;
  valueUsd: number;
  percentage: number;
}

export interface PortfolioMetrics {
  totalAssets: number;
  largestHoldingAsset: string | null;
  largestHoldingValue: number;
}

export interface PortfolioSummary {
  totalValueUsd: number;
  assets: PortfolioAsset[];
  allocation: PortfolioAllocation[];
  metrics: PortfolioMetrics;
  error: string | null;
}

export class PortfolioService {
  /**
   * Retrieves the comprehensive portfolio combining wallet balances with live prices.
   * Future extensibility: Will merge Vault positions, PT/YT tokens, and Yield here.
   */
  static async getPortfolio(): Promise<PortfolioSummary> {
    try {
      const address = await WalletService.getWalletAddress();
      if (!address) {
        return this.emptyPortfolio('Wallet not connected');
      }

      let rawBalances: WalletAssetBalance[] = [];
      try {
        rawBalances = await WalletService.getBalances();
      } catch (e: any) {
        return this.emptyPortfolio('Failed to fetch wallet balances');
      }

      const assets: PortfolioAsset[] = [];
      let totalValueUsd = 0;

      // Map over all balances and inject pricing
      for (const bal of rawBalances) {
        const balanceFloat = parseFloat(bal.amount) || 0;
        
        let priceUsd = 0;
        try {
          // Attempt to fetch price from CoinDCX integration
          // If Price API is unavailable, defaults to 0 gracefully
          const priceData = await PriceService.getAssetPrice(bal.assetCode);
          if (priceData) {
            priceUsd = priceData.priceUsd;
          }
        } catch (e) {
          console.warn(`Price API unavailable for ${bal.assetCode}, defaulting to 0`);
        }

        const valueUsd = balanceFloat * priceUsd;
        totalValueUsd += valueUsd;

        assets.push({
          assetCode: bal.assetCode,
          issuer: bal.issuer,
          balance: balanceFloat,
          priceUsd,
          valueUsd,
          allocationPercent: 0, // Calculated below after total is known
          isNative: bal.isNative,
          assetType: 'wallet' // Defaulting to wallet for now, extensible later
        });
      }

      // Second pass: Calculate allocation percentages and metrics
      let largestValue = 0;
      let largestAsset: string | null = null;
      const allocation: PortfolioAllocation[] = [];

      for (const asset of assets) {
        if (totalValueUsd > 0) {
          asset.allocationPercent = (asset.valueUsd / totalValueUsd) * 100;
        }

        allocation.push({
          assetCode: asset.assetCode,
          valueUsd: asset.valueUsd,
          percentage: asset.allocationPercent
        });

        if (asset.valueUsd > largestValue) {
          largestValue = asset.valueUsd;
          largestAsset = asset.assetCode;
        }
      }

      // Sort assets by highest USD value
      assets.sort((a, b) => b.valueUsd - a.valueUsd);
      allocation.sort((a, b) => b.valueUsd - a.valueUsd);

      return {
        totalValueUsd,
        assets,
        allocation,
        metrics: {
          totalAssets: assets.length,
          largestHoldingAsset: largestAsset,
          largestHoldingValue: largestValue
        },
        error: null
      };

    } catch (error: any) {
      console.error('PortfolioService Error:', error);
      return this.emptyPortfolio(error.message || 'Failed to construct portfolio');
    }
  }

  /**
   * Helper: Get only the total USD value of the portfolio
   */
  static async getPortfolioValue(): Promise<number> {
    const portfolio = await this.getPortfolio();
    return portfolio.totalValueUsd;
  }

  /**
   * Helper: Get the list of detailed portfolio assets
   */
  static async getPortfolioAssets(): Promise<PortfolioAsset[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.assets;
  }

  /**
   * Helper: Get only the allocation percentages
   */
  static async getAllocation(): Promise<PortfolioAllocation[]> {
    const portfolio = await this.getPortfolio();
    return portfolio.allocation;
  }

  /**
   * Utility to return a standardized empty state gracefully
   */
  private static emptyPortfolio(errorMessage: string | null = null): PortfolioSummary {
    return {
      totalValueUsd: 0,
      assets: [],
      allocation: [],
      metrics: {
        totalAssets: 0,
        largestHoldingAsset: null,
        largestHoldingValue: 0
      },
      error: errorMessage
    };
  }
}
