import React from 'react';
import { Users, Wallet, LogOut } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { useDAOStore } from '../store/daoStore';
import { truncateAddress } from '../utils/format';

const Header: React.FC = () => {
  const { connected, address, connectWallet, disconnectWallet } = useWalletStore();
  const { userMembership, treasuryBalance } = useDAOStore();
  
  const handleConnect = async () => {
    await connectWallet();
  };
  
  const handleDisconnect = () => {
    disconnectWallet();
  };
  
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Users className="text-white h-8 w-8 mr-2" />
          <h1 className="text-white text-2xl font-bold">HackathonDAO</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {treasuryBalance > 0 && (
            <div className="hidden md:block bg-white/10 rounded-full px-4 py-1 text-white">
              <span className="font-semibold">{treasuryBalance.toFixed(2)} ALGO</span> in treasury
            </div>
          )}
          
          {connected && address ? (
            <div className="flex items-center">
              {userMembership?.isMember && (
                <div className="hidden sm:flex items-center mr-4 bg-white/10 rounded-full px-3 py-1 text-white">
                  <span className="mr-1">
                    {userMembership.tier === 'lead' ? 'Team Lead' : 'Member'}
                  </span>
                  <span className="bg-purple-700 text-xs rounded-full px-2 py-0.5">
                    {userMembership.votingPower} votes
                  </span>
                </div>
              )}
              
              <div className="flex items-center bg-white/20 rounded-full overflow-hidden">
                <div className="px-3 py-1.5 text-white font-medium">
                  {truncateAddress(address)}
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="bg-white/10 hover:bg-white/20 p-2 transition-colors"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;