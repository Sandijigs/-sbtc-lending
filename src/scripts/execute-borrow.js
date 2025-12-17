#!/usr/bin/env node
/**
 * Execute Borrow Transaction on sbtc-lending Contract
 *
 * Usage: node src/scripts/execute-borrow.js <collateral> <borrow-amount>
 * Example: node src/scripts/execute-borrow.js 1000000000 500000000
 */

const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
require('dotenv').config();

// Configuration
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'sbtc-lending';
const NETWORK = new StacksTestnet();

async function executeBorrow(collateralAmount, borrowAmount) {
  console.log('=' .repeat(70));
  console.log('💰 Executing Borrow Transaction');
  console.log('=' .repeat(70));
  console.log();
  console.log(`Contract:          ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`Collateral Amount: ${collateralAmount} microSTX`);
  console.log(`Borrow Amount:     ${borrowAmount} microSTX`);
  console.log();

  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY not found in environment variables');
    console.log();
    console.log('Create a .env file with:');
    console.log('PRIVATE_KEY=your_private_key_here');
    process.exit(1);
  }

  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'borrow',
      functionArgs: [
        uintCV(collateralAmount),
        uintCV(borrowAmount),
      ],
      senderKey: privateKey,
      validateWithAbi: false,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    console.log('📝 Building transaction...');
    const transaction = await makeContractCall(txOptions);

    console.log('📡 Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

    console.log();
    console.log('✅ Transaction broadcast successful!');
    console.log();
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    console.log();
    console.log('=' .repeat(70));

    return broadcastResponse;

  } catch (error) {
    console.error('❌ Error executing borrow:', error);
    process.exit(1);
  }
}

// Parse command line arguments
if (require.main === module) {
  const collateral = process.argv[2] || '1000000000'; // 1000 STX
  const borrow = process.argv[3] || '500000000';      // 500 STX

  executeBorrow(parseInt(collateral), parseInt(borrow))
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { executeBorrow };
