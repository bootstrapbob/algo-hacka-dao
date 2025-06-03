import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useWalletStore, reconnectWallet } from './store/walletStore';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import WalletModal from './components/WalletModal';

function App() {
  const { connected, connectWallet } = useWalletStore();
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Try to reconnect wallet on page load
  useEffect(() => {
    reconnectWallet();
  }, []);
  
  // Show wallet modal if connect fails
  useEffect(() => {
    const handleConnectFailed = () => {
      if (!connected) {
        setShowWalletModal(true);
      }
    };
    
    // Add listener for connect errors
    window.addEventListener('walletConnect:error', handleConnectFailed);
    
    return () => {
      window.removeEventListener('walletConnect:error', handleConnectFailed);
    };
  }, [connected]);
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        {/* Wallet Guide Modal */}
        <WalletModal 
          isOpen={showWalletModal} 
          onClose={() => setShowWalletModal(false)} 
        />
      </div>
    </BrowserRouter>
  );
}

export default App;