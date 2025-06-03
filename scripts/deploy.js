import algosdk from 'algosdk';
import fs from 'fs';

// Constants for Algorand TestNet
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

// Initialize the client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// Your account details
const ACCOUNT_PRIVATE_KEY = '+pn2N5R/HywVzv3Ucq9ex7Hr9+Vv3IkX600H9tXdeQpK8lyoK4Tk2bQfUWbP8jQ0E9EVqsvolp0OgwmN0Ci7kw=='; // Replace with your private key
const creator = algosdk.mnemonicToSecretKey(ACCOUNT_PRIVATE_KEY);

async function compileProgram(client, programSource) {
  const response = await client.compile(programSource).do();
  return new Uint8Array(Buffer.from(response.result, 'base64'));
}

async function deployDAO() {
  try {
    // Read the TEAL files
    const approvalProgram = fs.readFileSync('./dao_approval.teal', 'utf8');
    const clearProgram = fs.readFileSync('./dao_clear.teal', 'utf8');
    
    // Compile the programs
    const compiledApproval = await compileProgram(algodClient, approvalProgram);
    const compiledClear = await compileProgram(algodClient, clearProgram);
    
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create application
    const txn = algosdk.makeApplicationCreateTxn(
      creator.addr,
      suggestedParams,
      algosdk.OnApplicationComplete.NoOpOC,
      compiledApproval,
      compiledClear,
      32, // Global ints
      64, // Global bytes
      16, // Local ints
      16, // Local bytes
      undefined,
      undefined,
      undefined,
      undefined
    );
    
    // Sign the transaction
    const signedTxn = txn.signTxn(creator.sk);
    
    // Submit the transaction
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    // Get the application ID
    const appId = result['application-index'];
    console.log('Deployed DAO contract with App ID:', appId);
    
    return appId;
  } catch (error) {
    console.error('Error deploying DAO contract:', error);
    throw error;
  }
}

// Deploy the contract
deployDAO();