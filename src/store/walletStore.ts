import { create } from 'zustand';
import { peraWallet } from '../utils/algorand';
import { WalletState } from '../types';

export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  address: null,
  connecting: false,
  provider: null,
  
  connectWallet: async () => {
    try {
      set({ connecting: true });
      
      // Request connection to wallet
      const accounts = await peraWallet.connect();
      
      // Set up disconnect event handler
      peraWallet.connector?.on('disconnect', () => {
        set({ connected: false, address: null, provider: null });
      });
      
      if (accounts.length > 0) {
        set({
          connected: true,
          address: accounts[0],
          provider: peraWallet,
          connecting: false
        });
        
        // Save the connection info to local storage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
      } else {
        set({ connecting: false });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      set({ connecting: false });
    }
  },
  
  disconnectWallet: () => {
    try {
      peraWallet.disconnect();
      set({
        connected: false,
        address: null,
        provider: null
      });
      
      // Clear local storage
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }
}));

// Auto reconnect on page load if previously connected
export const reconnectWallet = async () => {
  const walletConnected = localStorage.getItem('walletConnected') === 'true';
  
  if (walletConnected) {
    const walletStore = useWalletStore.getState();
    await walletStore.connectWallet();
  }
};