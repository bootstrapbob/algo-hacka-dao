import React from 'react';
import { Wallet, X, ExternalLink } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet } = useWalletStore();
  
  if (!isOpen) return null;
  
  const handleConnect = async () => {
    await connectWallet();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wallet className="text-indigo-600 h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Connect Your Wallet</h2>
            <p className="text-gray-600 mt-2">
              You need Pera Wallet to continue
            </p>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Don't have Pera Wallet?</h3>
            <p className="text-gray-600 text-sm mb-3">
              Pera Wallet is a secure and easy-to-use wallet for Algorand blockchain.
            </p>
            <a 
              href="https://perawallet.app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center"
            >
              Download Pera Wallet <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleConnect}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
            >
              <img 
                src="https://perawallet.app/static/logo-6192aa11d7022c64666029faa8a2bc87.png"
                alt="Pera Wallet"
                className="w-6 h-6 mr-2"
              />
              Connect with Pera Wallet
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
            >
              I'll Do This Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;