import { PriceOracleService } from './priceOracleService';

export interface ProtocolState {
  tvlXlm: number;
  tvlUsd: number;
  totalDepositsXlm: number;
  ptSupplyXlm: number;
  ytSupplyXlm: number;
  dexLiquidityXlm: number;
  impliedYieldApy: number;
  ptPriceUnderlying: number;
}

export class ProtocolService {
  /**
   * Helper to unwrap Soroban Result types
   */
  private static unwrapResult(rawResult: any): any {
    if (rawResult !== undefined && typeof rawResult === 'object' && rawResult !== null) {
      if (typeof rawResult.unwrap === 'function') return rawResult.unwrap();
      if ('ok' in rawResult) return rawResult.ok;
      if ('value' in rawResult) return rawResult.value;
    }
    return rawResult;
  }

  static async getProtocolState(): Promise<ProtocolState> {
    const defaultState: ProtocolState = {
      tvlXlm: 0,
      tvlUsd: 0,
      totalDepositsXlm: 0,
      ptSupplyXlm: 0,
      ytSupplyXlm: 0,
      dexLiquidityXlm: 0,
      impliedYieldApy: 0,
      ptPriceUnderlying: 1.0,
    };

    try {
      // Dynamic imports to match portfolioService architecture
      const { Client: PtClient } = await import('../../packages/bindings/pt_token/src/index');
      const { Client: YtClient } = await import('../../packages/bindings/yt_token/src/index');
      const { Client: VaultClient } = await import('../../packages/bindings/vault/src/index');
      const { Client: MarketplaceClient } = await import('../../packages/bindings/marketplace/src/index');
      const { CONTRACTS, RPC_URL, NETWORK_PASSPHRASE } = await import('../config/contracts');

      const clientOptions = {
        rpcUrl: RPC_URL,
        networkPassphrase: NETWORK_PASSPHRASE,
      };

      const ptClient = new PtClient({ ...clientOptions, contractId: CONTRACTS.PT_TOKEN });
      const ytClient = new YtClient({ ...clientOptions, contractId: CONTRACTS.YT_TOKEN });
      const vaultClient = new VaultClient({ ...clientOptions, contractId: CONTRACTS.VAULT });
      const marketClient = new MarketplaceClient({ ...clientOptions, contractId: CONTRACTS.MARKETPLACE });

      // Fetch all state concurrently
      const [
        ptSupplyRes,
        ytSupplyRes,
        vaultSharesRes,
        reservesRes,
        ptPriceRes,
      ] = await Promise.allSettled([
        ptClient.total_supply(),
        ytClient.total_supply(),
        vaultClient.total_vault_shares(),
        marketClient.get_reserves(),
        marketClient.get_pt_price()
      ]);

      // Parse Results
      const ptSupplyXlm = ptSupplyRes.status === 'fulfilled' ? Number(this.unwrapResult(ptSupplyRes.value.result) || 0) / 1e7 : 0;
      const ytSupplyXlm = ytSupplyRes.status === 'fulfilled' ? Number(this.unwrapResult(ytSupplyRes.value.result) || 0) / 1e7 : 0;
      const totalDepositsXlm = vaultSharesRes.status === 'fulfilled' ? Number(this.unwrapResult(vaultSharesRes.value.result) || 0) / 1e7 : 0;

      let dexLiquidityXlm = 0;
      if (reservesRes.status === 'fulfilled') {
        const reserves = this.unwrapResult(reservesRes.value.result);
        if (Array.isArray(reserves) && reserves.length >= 2) {
          // reserves[1] is underlying_reserve. Assuming 50/50 AMM, total liquidity = underlying * 2
          const underlyingReserve = Number(reserves[1]) / 1e7;
          dexLiquidityXlm = underlyingReserve * 2;
        }
      }

      let ptPriceUnderlying = 1.0;
      let impliedYieldApy = 0;
      if (ptPriceRes.status === 'fulfilled') {
        const rawPtPrice = Number(this.unwrapResult(ptPriceRes.value.result));
        if (!isNaN(rawPtPrice) && rawPtPrice > 0) {
          const rawContractPtPrice = rawPtPrice / 1e9; // 9 decimals for Soroban price
          ptPriceUnderlying = rawContractPtPrice; // Price is already correctly formatted (Underlying/PT)
          
          // Import yieldService to fetch dynamic maturity timestamp and face value
          const { YieldService } = await import('./yieldService');
          const [maturityTimestampMs, ptFaceValueInUnderlying] = await Promise.all([
            YieldService.getActiveMaturityTimestampMs(),
            YieldService.getEpochStartIndex()
          ]);
          
          const { calculateMarketImpliedApy } = await import('../utils/apy');
          impliedYieldApy = calculateMarketImpliedApy(ptPriceUnderlying, ptFaceValueInUnderlying, maturityTimestampMs);
        }
      }

      // XLM Price for TVL calculation
      let xlmPriceUsd = 0.1; // Fallback
      try {
        const priceData = await PriceOracleService.getAssetPrice('XLM');
        if (priceData && priceData.priceUsd) {
          xlmPriceUsd = priceData.priceUsd;
        }
      } catch (e) {
        console.warn("Could not fetch XLM price");
      }

      const tvlXlm = totalDepositsXlm; // TVL = Total Deposits
      const tvlUsd = tvlXlm * xlmPriceUsd;

      return {
        tvlXlm,
        tvlUsd,
        totalDepositsXlm,
        ptSupplyXlm,
        ytSupplyXlm,
        dexLiquidityXlm,
        impliedYieldApy,
        ptPriceUnderlying
      };
    } catch (e) {
      console.error('Failed to fetch protocol state:', e);
      return defaultState;
    }
  }
}
