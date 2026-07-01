import { useState, useEffect } from 'react';
import { WalletService } from '../services/walletService';

export function useWallet() {
  const [state, setState] = useState(WalletService.getState());

  useEffect(() => {
    // Automatically try to reconnect when the hook is first used
    // (This runs on application load)
    WalletService.init();

    // Subscribe to any state changes from the WalletService
    const unsubscribe = WalletService.onConnectionChange(() => {
      setState(WalletService.getState());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { 
    ...state,
    connect: async () => {
      try {
        console.log("1. Connect Wallet button clicked");
        console.log("2. Calling walletService.connectWallet()");
        await WalletService.connectWallet();
        console.log("8. Final React wallet state:", WalletService.getState());
      } catch (e: any) {
        console.error("7. Caught error in useWallet.connect():", e);
      }
    },
    disconnect: () => WalletService.disconnectWallet(),
    refreshBalances: () => WalletService.refreshBalances()
  };
}
