import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

// Constants for Algorand TestNet
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';
const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
const INDEXER_PORT = '';
const INDEXER_TOKEN = '';

// App ID for the DAO smart contract (This would be set after deployment)
export const APP_ID = 123456789; // Replace with your deployed app ID

// Initialize clients
export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
export const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

// Initialize Pera Wallet connector
export const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: true
});

// Helper function to wait for transaction confirmation
export const waitForConfirmation = async (txId: string): Promise<void> => {
  const status = await algodClient.status().do();
  let lastRound = status['last-round'];
  
  while (true) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
      break;
    }
    lastRound += 1;
    await algodClient.statusAfterBlock(lastRound).do();
  }
};

// Get account information
export const getAccountInfo = async (address: string): Promise<any> => {
  try {
    return await algodClient.accountInformation(address).do();
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

// Check if an address is a member of the DAO
export const checkMembership = async (address: string): Promise<boolean> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const appLocalState = accountInfo['apps-local-state']?.find(
      (app: any) => app.id === APP_ID
    );
    return !!appLocalState;
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
};

// Get user's voting power
export const getVotingPower = async (address: string): Promise<number> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const appLocalState = accountInfo['apps-local-state']?.find(
      (app: any) => app.id === APP_ID
    );
    
    if (!appLocalState) return 0;
    
    const votingPowerKey = btoa('voting_power');
    const votingPower = appLocalState['key-value']?.find(
      (kv: any) => kv.key === votingPowerKey
    );
    
    return votingPower ? votingPower.value.uint : 0;
  } catch (error) {
    console.error('Error getting voting power:', error);
    return 0;
  }
};

// Join the DAO (opt into the app)
export const joinDAO = async (
  address: string,
  tier: 'basic' | 'lead'
): Promise<string> => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    let txns = [];
    
    // App opt-in transaction
    const optInTxn = algosdk.makeApplicationOptInTxn(
      address,
      suggestedParams,
      APP_ID,
      [],
      [],
      [],
      [],
      undefined,
      undefined,
      undefined,
      tier === 'lead' ? [algosdk.encodeUint64(1)] : [algosdk.encodeUint64(0)]
    );
    
    // If team lead, add deposit transaction
    if (tier === 'lead') {
      const depositAmount = 10 * 1000000; // 10 ALGO in microALGO
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParams(
        address,
        algosdk.getApplicationAddress(APP_ID),
        depositAmount,
        undefined,
        undefined,
        suggestedParams
      );
      
      txns = [optInTxn, paymentTxn];
      // Group the transactions
      algosdk.assignGroupID(txns);
    } else {
      txns = [optInTxn];
    }
    
    // Get the transaction signed
    const signedTxns = await peraWallet.signTransaction([
      txns.map(txn => ({ txn, signers: [address] }))
    ]);
    
    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    await waitForConfirmation(txId);
    
    return txId;
  } catch (error) {
    console.error('Error joining DAO:', error);
    throw error;
  }
};

// Create a proposal
export const createProposal = async (
  address: string,
  title: string,
  description: string,
  type: 'fund' | 'text',
  amount?: number
): Promise<string> => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const appArgs = [
      new Uint8Array(Buffer.from('create_proposal')),
      new Uint8Array(Buffer.from(title)),
      new Uint8Array(Buffer.from(description)),
      new Uint8Array(Buffer.from(type)),
    ];
    
    if (type === 'fund' && amount) {
      appArgs.push(algosdk.encodeUint64(amount * 1000000)); // Convert ALGO to microALGO
    }
    
    const txn = algosdk.makeApplicationNoOpTxn(
      address,
      suggestedParams,
      APP_ID,
      appArgs
    );
    
    // Get the transaction signed
    const signedTxn = await peraWallet.signTransaction([[{ txn, signers: [address] }]]);
    
    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await waitForConfirmation(txId);
    
    return txId;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

// Vote on a proposal
export const voteOnProposal = async (
  address: string,
  proposalId: number,
  vote: 'yes' | 'no'
): Promise<string> => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationNoOpTxn(
      address,
      suggestedParams,
      APP_ID,
      [
        new Uint8Array(Buffer.from('vote')),
        algosdk.encodeUint64(proposalId),
        new Uint8Array(Buffer.from(vote)),
      ]
    );
    
    // Get the transaction signed
    const signedTxn = await peraWallet.signTransaction([[{ txn, signers: [address] }]]);
    
    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await waitForConfirmation(txId);
    
    return txId;
  } catch (error) {
    console.error('Error voting on proposal:', error);
    throw error;
  }
};

// Execute a passed proposal
export const executeProposal = async (
  address: string,
  proposalId: number
): Promise<string> => {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationNoOpTxn(
      address,
      suggestedParams,
      APP_ID,
      [
        new Uint8Array(Buffer.from('execute')),
        algosdk.encodeUint64(proposalId),
      ]
    );
    
    // Get the transaction signed
    const signedTxn = await peraWallet.signTransaction([[{ txn, signers: [address] }]]);
    
    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await waitForConfirmation(txId);
    
    return txId;
  } catch (error) {
    console.error('Error executing proposal:', error);
    throw error;
  }
};

// Get treasury balance
export const getTreasuryBalance = async (): Promise<number> => {
  try {
    const appAddress = algosdk.getApplicationAddress(APP_ID);
    const accountInfo = await algodClient.accountInformation(appAddress).do();
    return accountInfo.amount / 1000000; // Convert microALGO to ALGO
  } catch (error) {
    console.error('Error getting treasury balance:', error);
    return 0;
  }
};

// Get all proposals
export const getProposals = async (): Promise<any[]> => {
  try {
    // This is a simplified version. In a real app, you would query the app's global state
    // or use the indexer to get all proposals
    const appInfo = await algodClient.getApplicationByID(APP_ID).do();
    const globalState = appInfo.params['global-state'];
    
    const proposals: any[] = [];
    const proposalCountKey = btoa('proposal_count');
    const proposalCountValue = globalState.find((kv: any) => kv.key === proposalCountKey);
    
    if (!proposalCountValue) return [];
    
    const proposalCount = proposalCountValue.value.uint;
    
    // This is a simplified approach. In a real app, you would parse the global state
    // to extract all proposal details
    for (let i = 1; i <= proposalCount; i++) {
      const proposalKey = btoa(`proposal_${i}`);
      const proposalValue = globalState.find((kv: any) => kv.key === proposalKey);
      
      if (proposalValue) {
        // Parse the proposal data (this is simplified)
        // In a real app, you would decode the bytes properly
        proposals.push({
          id: i,
          // Other proposal details would be parsed from the value
        });
      }
    }
    
    return proposals;
  } catch (error) {
    console.error('Error getting proposals:', error);
    return [];
  }
};