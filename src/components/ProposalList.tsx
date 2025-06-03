import React, { useState } from 'react';
import { useDAOStore } from '../store/daoStore';
import { useWalletStore } from '../store/walletStore';
import { Calendar, Clock, ThumbsUp, ThumbsDown, Play } from 'lucide-react';
import { truncateAddress } from '../utils/format';

const ProposalList: React.FC = () => {
  const { proposals, voteOnProposal, executeProposal, loading } = useDAOStore();
  const { address } = useWalletStore();
  
  const [activeTab, setActiveTab] = useState<'active' | 'passed' | 'all'>('active');
  
  // Filter proposals based on active tab
  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'active') return proposal.status === 'active';
    if (activeTab === 'passed') return proposal.status === 'passed' || proposal.status === 'executed';
    return true; // 'all' tab
  });
  
  const handleVote = async (proposalId: number, vote: 'yes' | 'no') => {
    await voteOnProposal(proposalId, vote);
  };
  
  const handleExecute = async (proposalId: number) => {
    await executeProposal(proposalId);
  };
  
  const formatDeadline = (timestamp: number) => {
    const deadline = new Date(timestamp);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Ended';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };
  
  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'active'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'passed'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('passed')}
        >
          Passed
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'all'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
      </div>
      
      {/* Proposals */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No proposals found in this category.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProposals.map((proposal) => (
            <div 
              key={proposal.id} 
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Proposal Header */}
              <div className="border-b px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center">
                    <span className="font-medium text-gray-800">{proposal.title}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      proposal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      proposal.status === 'passed' ? 'bg-green-100 text-green-800' :
                      proposal.status === 'executed' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </span>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>By {truncateAddress(proposal.creator)}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {proposal.status === 'active' && (
                  <div className="hidden sm:flex items-center text-xs font-medium text-orange-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDeadline(proposal.deadline)}
                  </div>
                )}
              </div>
              
              {/* Proposal Body */}
              <div className="px-4 py-3">
                <p className="text-gray-700 mb-4">{proposal.description}</p>
                
                {proposal.type === 'fund' && proposal.amount && (
                  <div className="mb-4 bg-indigo-50 text-indigo-800 px-3 py-2 rounded-md inline-block">
                    <span className="font-medium">Amount:</span> {proposal.amount} ALGO
                  </div>
                )}
                
                {/* Voting Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1 text-green-600" />
                      <span>{proposal.yesVotes} votes</span>
                    </div>
                    <div className="flex items-center">
                      <span>{proposal.noVotes} votes</span>
                      <ThumbsDown className="h-4 w-4 ml-1 text-red-600" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    {proposal.yesVotes + proposal.noVotes > 0 ? (
                      <div 
                        className="h-full bg-green-500" 
                        style={{ 
                          width: `${(proposal.yesVotes / (proposal.yesVotes + proposal.noVotes)) * 100}%` 
                        }}
                      />
                    ) : (
                      <div className="h-full bg-gray-300 w-0" />
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                {proposal.status === 'active' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVote(proposal.id, 'yes')}
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Yes
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'no')}
                      disabled={loading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      No
                    </button>
                  </div>
                )}
                
                {proposal.status === 'passed' && (
                  <button
                    onClick={() => handleExecute(proposal.id)}
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Proposal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalList;