import { create } from 'zustand';
import { 
  checkMembership, 
  getVotingPower,
  joinDAO as joinDAOAlgorand,
  createProposal as createProposalAlgorand,
  voteOnProposal as voteOnProposalAlgorand,
  executeProposal as executeProposalAlgorand,
  getTreasuryBalance,
  getProposals
} from '../utils/algorand';
import { DAOState, Member, Proposal } from '../types';
import { useWalletStore } from './walletStore';

export const useDAOStore = create<DAOState>((set, get) => ({
  members: [],
  proposals: [],
  treasuryBalance: 0,
  userMembership: null,
  loading: false,
  error: null,
  
  fetchMembers: async () => {
    // This is a simplified version
    // In a real app, you would query all members from the blockchain
    set({ loading: true, error: null });
    try {
      // For demo purposes, we're just checking the current user
      const { address } = useWalletStore.getState();
      if (!address) {
        set({ loading: false });
        return;
      }
      
      const isMember = await checkMembership(address);
      
      if (isMember) {
        const votingPower = await getVotingPower(address);
        const tier = votingPower > 1 ? 'lead' : 'basic';
        
        const member: Member = {
          address,
          votingPower,
          joinTimestamp: Date.now(), // This would come from the blockchain in a real app
          isMember: true,
          tier
        };
        
        set({ userMembership: member, loading: false });
      } else {
        set({ 
          userMembership: {
            address,
            votingPower: 0,
            joinTimestamp: 0,
            isMember: false,
            tier: 'basic'
          }, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      set({ loading: false, error: 'Failed to fetch members' });
    }
  },
  
  fetchProposals: async () => {
    set({ loading: true, error: null });
    try {
      const rawProposals = await getProposals();
      
      // Transform raw proposals into our app format
      // This is simplified - in a real app you would parse the blockchain data properly
      const proposals: Proposal[] = rawProposals.map((raw: any) => ({
        id: raw.id,
        title: raw.title || 'Proposal Title',
        description: raw.description || 'Proposal Description',
        creator: raw.creator || 'Unknown',
        type: raw.type || 'text',
        amount: raw.amount,
        yesVotes: raw.yesVotes || 0,
        noVotes: raw.noVotes || 0,
        deadline: raw.deadline || (Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: raw.status || 'active',
        createdAt: raw.createdAt || Date.now()
      }));
      
      set({ proposals, loading: false });
    } catch (error) {
      console.error('Error fetching proposals:', error);
      set({ loading: false, error: 'Failed to fetch proposals' });
    }
  },
  
  fetchTreasuryBalance: async () => {
    set({ loading: true, error: null });
    try {
      const balance = await getTreasuryBalance();
      set({ treasuryBalance: balance, loading: false });
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
      set({ loading: false, error: 'Failed to fetch treasury balance' });
    }
  },
  
  joinDAO: async (tier: 'basic' | 'lead') => {
    set({ loading: true, error: null });
    try {
      const { address } = useWalletStore.getState();
      if (!address) {
        set({ loading: false, error: 'Wallet not connected' });
        return;
      }
      
      await joinDAOAlgorand(address, tier);
      
      // After joining, update the user's membership status
      await get().fetchMembers();
      
      set({ loading: false });
    } catch (error) {
      console.error('Error joining DAO:', error);
      set({ loading: false, error: 'Failed to join DAO' });
    }
  },
  
  createProposal: async (proposal) => {
    set({ loading: true, error: null });
    try {
      const { address } = useWalletStore.getState();
      if (!address) {
        set({ loading: false, error: 'Wallet not connected' });
        return;
      }
      
      await createProposalAlgorand(
        address,
        proposal.title,
        proposal.description,
        proposal.type,
        proposal.amount
      );
      
      // After creating, refresh the proposals list
      await get().fetchProposals();
      
      set({ loading: false });
    } catch (error) {
      console.error('Error creating proposal:', error);
      set({ loading: false, error: 'Failed to create proposal' });
    }
  },
  
  voteOnProposal: async (proposalId, vote) => {
    set({ loading: true, error: null });
    try {
      const { address } = useWalletStore.getState();
      if (!address) {
        set({ loading: false, error: 'Wallet not connected' });
        return;
      }
      
      await voteOnProposalAlgorand(address, proposalId, vote);
      
      // After voting, refresh the proposals list
      await get().fetchProposals();
      
      set({ loading: false });
    } catch (error) {
      console.error('Error voting on proposal:', error);
      set({ loading: false, error: 'Failed to vote on proposal' });
    }
  },
  
  executeProposal: async (proposalId) => {
    set({ loading: true, error: null });
    try {
      const { address } = useWalletStore.getState();
      if (!address) {
        set({ loading: false, error: 'Wallet not connected' });
        return;
      }
      
      await executeProposalAlgorand(address, proposalId);
      
      // After executing, refresh the proposals and treasury balance
      await get().fetchProposals();
      await get().fetchTreasuryBalance();
      
      set({ loading: false });
    } catch (error) {
      console.error('Error executing proposal:', error);
      set({ loading: false, error: 'Failed to execute proposal' });
    }
  }
}));