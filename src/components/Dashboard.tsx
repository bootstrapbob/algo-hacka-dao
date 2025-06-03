import React, { useEffect } from 'react';
import { useDAOStore } from '../store/daoStore';
import { useWalletStore } from '../store/walletStore';
import { Users, BarChart3, Calendar, CircleDollarSign } from 'lucide-react';
import ProposalList from './ProposalList';
import NewProposalForm from './NewProposalForm';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { 
    userMembership, 
    treasuryBalance, 
    proposals, 
    fetchMembers, 
    fetchProposals, 
    fetchTreasuryBalance 
  } = useDAOStore();
  
  const { connected, address } = useWalletStore();
  
  useEffect(() => {
    if (connected && address) {
      fetchMembers();
      fetchProposals();
      fetchTreasuryBalance();
    }
  }, [connected, address, fetchMembers, fetchProposals, fetchTreasuryBalance]);
  
  // If not connected or not a member, redirect to home
  if (!connected || !address || !userMembership?.isMember) {
    return <Navigate to="/" />;
  }
  
  const activeProposals = proposals.filter(p => p.status === 'active').length;
  const passedProposals = proposals.filter(p => p.status === 'passed' || p.status === 'executed').length;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Team Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <Users className="text-indigo-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Membership Tier</p>
              <p className="text-gray-800 font-semibold text-xl">
                {userMembership?.tier === 'lead' ? 'Team Lead' : 'Member'}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <BarChart3 className="text-purple-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Your Voting Power</p>
              <p className="text-gray-800 font-semibold text-xl">
                {userMembership?.votingPower || 0} votes
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
            <div className="bg-pink-100 p-3 rounded-full mr-4">
              <Calendar className="text-pink-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Proposals</p>
              <p className="text-gray-800 font-semibold text-xl">
                {activeProposals} ({passedProposals} passed)
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CircleDollarSign className="text-green-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Treasury Balance</p>
              <p className="text-gray-800 font-semibold text-xl">
                {treasuryBalance.toFixed(2)} ALGO
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Proposal Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create Proposal</h2>
              <NewProposalForm />
            </div>
          </div>
          
          {/* Proposals List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Team Proposals</h2>
              <ProposalList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;