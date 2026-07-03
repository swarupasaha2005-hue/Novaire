import {
  isConnected as freighterIsConnected,
  getAddress,
  getNetworkDetails,
  requestAccess
} from '@stellar/freighter-api';

export interface WalletAssetBalance {
  assetCode: string;
  issuer: string | null;
  amount: string;
  isNative: boolean;
}

export interface WalletConnectionState {
  address: string | null;
  network: string | null;
  error: string | null;
  isConnected: boolean;
  balances: WalletAssetBalance[];
  loading: boolean;
}

export class WalletService {
  private static listeners: Array<() => void> = [];
  
  private static state: WalletConnectionState = {
    address: null,
    network: null,
    error: null,
    isConnected: false,
    balances: [],
    loading: false
  };

  static getState(): WalletConnectionState {
    return { ...this.state };
  }

  static onConnectionChange(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  private static setState(newState: Partial<WalletConnectionState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  /**
   * Check if Freighter is installed and available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const result = await freighterIsConnected();
      return result.isConnected === true;
    } catch {
      return false;
    }
  }

  /**
   * Auto-connect if the user has previously granted permission.
   * Useful to call on application mount.
   */
  static async init(): Promise<void> {
    if (this.state.isConnected) return; // Prevent re-initialization on navigation
    if (this.state.loading) return; // Prevent duplicate initialization
    
    this.setState({ loading: true, error: null });
    
    try {
      const available = await this.isAvailable();
      if (!available) {
        this.setState({ loading: false });
        return;
      }

      const addressData = await getAddress();
      if (addressData && addressData.address) {
        const address = addressData.address;
        const network = await this.getNetwork();
        
        // Enforce network rule even on auto-connect
        console.log("init() - Result of comparison network !== 'TESTNET':", network !== 'TESTNET');
        if (network !== 'TESTNET') {
           console.log("init() - Comparison failed because network is:", `"${network}"`, "expected:", `"TESTNET"`);
           this.setState({ 
             error: 'Please switch your Freighter wallet to Testnet.', 
             isConnected: false, 
             loading: false 
           });
           return;
        }

        this.setState({ address, network, isConnected: true, error: null });
        await this.refreshBalances();
      }
    } catch (e: any) {
      this.setState({ error: e.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Request access to the user's wallet
   */
  static async connectWallet(): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const available = await this.isAvailable();
      if (!available) {
        throw new Error('Freighter wallet is not installed or unavailable');
      }

      console.log("3. Freighter permission request started");
      const accessResponse = await requestAccess();
      console.log("4. Freighter returned successfully");
      
      if (accessResponse.error) {
        throw new Error(String(accessResponse.error));
      }

      const address = accessResponse.address || await this.fetchWalletAddress();
      console.log("5. Wallet address returned:", address);
      
      const network = await this.getNetwork();
      console.log("6. Network returned:", network);
      console.log("Freighter network:", network);

      if (!address) {
        throw new Error('Wallet access rejected or address not found');
      }

      console.log("Result of comparison network !== 'TESTNET':", network !== 'TESTNET');
      if (network !== 'TESTNET') {
        console.log("Comparison failed because network is:", `"${network}"`, "expected:", `"TESTNET"`);
        throw new Error('Please switch your Freighter wallet to Testnet to continue.');
      }

      this.setState({
        address,
        network,
        error: null,
        isConnected: true
      });

      await this.refreshBalances();
    } catch (error: any) {
      console.error("7. Caught error in WalletService.connectWallet:", error);
      this.setState({
        address: null,
        network: null,
        error: error.message || 'Failed to connect wallet',
        isConnected: false
      });
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Disconnect the wallet (client-side state reset)
   */
  static disconnectWallet(): void {
    this.setState({
      address: null,
      network: null,
      error: null,
      isConnected: false,
      balances: []
    });
  }

  private static async fetchWalletAddress(): Promise<string | null> {
    try {
      const response = await getAddress();
      return response.address || null;
    } catch {
      return null;
    }
  }

  /**
   * Get the currently selected network in Freighter
   */
  static async getNetwork(): Promise<string | null> {
    try {
      const response = await getNetworkDetails();
      return response?.network || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch Native XLM and all other Stellar asset balances from Horizon
   * Internal wrapper that automatically sets state.
   */
  static async refreshBalances(): Promise<void> {
    const { address, network, isConnected } = this.state;
    if (!isConnected || !address) return;

    try {
      console.log("1. Fetching balances for wallet address:", address);
      console.log("2. Detected Stellar network:", network);
      
      let horizonUrl = 'https://horizon.stellar.org';
      if (network === 'TESTNET') {
        horizonUrl = 'https://horizon-testnet.stellar.org';
      } else if (network === 'FUTURENET') {
        horizonUrl = 'https://horizon-futurenet.stellar.org';
      }

      const endpoint = `${horizonUrl}/accounts/${address}`;
      console.log("3. Horizon endpoint being queried:", endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Account Not Found: This wallet has not been funded yet. Please send some XLM to this address on Testnet to initialize it.');
        }
        throw new Error(`Horizon API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("4. Raw JSON response returned by Horizon:", data);
      
      const balances: WalletAssetBalance[] = [];

      if (data.balances && Array.isArray(data.balances)) {
        for (const bal of data.balances) {
          if (bal.asset_type === 'native') {
            balances.push({
              assetCode: 'XLM',
              issuer: null,
              amount: bal.balance,
              isNative: true
            });
          } else {
            balances.push({
              assetCode: bal.asset_code,
              issuer: bal.asset_issuer,
              amount: bal.balance,
              isNative: false
            });
          }
        }
      }

      console.log("Parsed balances output:", balances);
      this.setState({ balances });
    } catch (error: any) {
      console.error('Failed to fetch wallet balances:', error);
      // DO NOT clear balances on refresh error to prevent portfolio value collapse
      this.setState({ error: error.message || 'Failed to refresh balances' });
    }
  }

  // To be used by other services (like portfolioService)
  static async getWalletAddress(): Promise<string | null> {
    return this.state.address;
  }

  static async getBalances(): Promise<WalletAssetBalance[]> {
    return this.state.balances;
  }
}
