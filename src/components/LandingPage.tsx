import React from 'react';
import { Users, Vote, LineChart, Coins } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { useDAOStore } from '../store/daoStore';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { connected, connectWallet } = useWalletStore();
  const { userMembership, joinDAO, loading } = useDAOStore();
  
  const handleConnectWallet = async () => {
    await connectWallet();
  };
  
  const handleJoinDAO = async (tier: 'basic' | 'lead') => {
    await joinDAO(tier);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to HackathonDAO
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A simple way for hackathon teams to make decisions, manage funds, and vote on proposals.
          </p>
          
          {!connected ? (
            <button
              onClick={handleConnectWallet}
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Connect Your Wallet
            </button>
          ) : !userMembership?.isMember ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleJoinDAO('basic')}
                disabled={loading}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join as Member'}
              </button>
              <button
                onClick={() => handleJoinDAO('lead')}
                disabled={loading}
                className="bg-purple-800 text-white hover:bg-purple-700 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join as Team Lead (10 ALGO)'}
              </button>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg inline-block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Simple Team Governance for Hackathons
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="text-indigo-600 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Join Your Team</h3>
            <p className="text-gray-600">
              Connect your wallet and join as a member or team lead to participate in decision making.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Vote className="text-purple-600 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Vote on Proposals</h3>
            <p className="text-gray-600">
              Review and vote on proposals to make team decisions transparent and democratic.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-pink-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <LineChart className="text-pink-600 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Track Progress</h3>
            <p className="text-gray-600">
              Monitor proposal status and outcomes to keep everyone on the same page.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Coins className="text-indigo-600 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Manage Funds</h3>
            <p className="text-gray-600">
              Collectively decide how to allocate team resources and track spending.
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4 md:mb-0 md:mr-6 shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Use Pera Wallet to easily connect to the HackathonDAO. If you don't have it yet, we'll guide you through setting it up.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4 md:mb-0 md:mr-6 shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Join the Team</h3>
                <p className="text-gray-600">
                  Join as a regular member for free, or become a team lead by depositing 10 ALGO for increased voting power.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4 md:mb-0 md:mr-6 shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Create & Vote on Proposals</h3>
                <p className="text-gray-600">
                  Submit proposals for team decisions or fund allocations, then vote on active proposals within the voting period.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold text-indigo-600 mb-4 md:mb-0 md:mr-6 shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Execute Approved Decisions</h3>
                <p className="text-gray-600">
                  When a proposal passes, it can be executed automatically, distributing funds or recording decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;