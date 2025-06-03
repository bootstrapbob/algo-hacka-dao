export interface Member {
  address: string;
  votingPower: number;
  joinTimestamp: number;
  isMember: boolean;
  tier: 'basic' | 'lead';
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  type: 'fund' | 'text';
  amount?: number;
  yesVotes: number;
  noVotes: number;
  deadline: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: number;
}

export interface Vote {
  proposalId: number;
  voter: string;
  vote: 'yes' | 'no';
  votingPower: number;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  provider: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export interface DAOState {
  members: Member[];
  proposals: Proposal[];
  treasuryBalance: number;
  userMembership: Member | null;
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  fetchProposals: () => Promise<void>;
  fetchTreasuryBalance: () => Promise<void>;
  joinDAO: (tier: 'basic' | 'lead') => Promise<void>;
  createProposal: (proposal: Omit<Proposal, 'id' | 'creator' | 'yesVotes' | 'noVotes' | 'status' | 'createdAt'>) => Promise<void>;
  voteOnProposal: (proposalId: number, vote: 'yes' | 'no') => Promise<void>;
  executeProposal: (proposalId: number) => Promise<void>;
}