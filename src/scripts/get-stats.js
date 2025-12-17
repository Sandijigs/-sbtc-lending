#!/usr/bin/env node
/**
 * Get Protocol Statistics from sbtc-lending Contract
 *
 * Usage: node src/scripts/get-stats.js
 */

const {
  callReadOnlyFunction,
  cvToJSON,
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

// Configuration
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'sbtc-lending';
const NETWORK = new StacksTestnet();

async function getProtocolStats() {
  console.log('=' .repeat(70));
  console.log('📊 sbtc-lending Protocol Statistics');
  console.log('=' .repeat(70));
  console.log();
  console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`Network:  testnet`);
  console.log();

  try {
    // Get protocol stats
    const statsResult = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-protocol-stats',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const stats = cvToJSON(statsResult);
    console.log('Protocol Stats:');
    console.log('  Total Collateral Locked:', stats.value['total-collateral'].value, 'microSTX');
    console.log('  Total Borrowed:         ', stats.value['total-borrowed'].value, 'microSTX');
    console.log('  Protocol Fees:          ', stats.value['protocol-fees'].value, 'microSTX');
    console.log('  sBTC Price:             ', stats.value['sbtc-price'].value, 'microSTX/BTC');
    console.log();

    // Get current time
    const timeResult = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-current-time',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const currentTime = cvToJSON(timeResult);
    console.log('Current Block Time:', currentTime.value, 'seconds');
    console.log();

    console.log('=' .repeat(70));
    console.log('✅ Stats retrieved successfully');
    console.log('=' .repeat(70));

    return { stats, currentTime };

  } catch (error) {
    console.error('❌ Error getting stats:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  getProtocolStats()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { getProtocolStats };
