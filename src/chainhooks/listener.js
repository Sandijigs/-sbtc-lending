#!/usr/bin/env node
/**
 * Hiro Chainhooks Listener for sbtc-lending Contract
 * Monitors all events emitted by the contract
 *
 * Events tracked:
 * - collateral-approved
 * - loan-created
 * - loan-repaid
 * - collateral-added
 * - loan-liquidated
 * - price-updated
 */

const { ChainhookClient } = require('@hirosystems/chainhooks-client');
require('dotenv').config();

// Contract configuration
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-lending';
const NETWORK = 'testnet';

// Chainhook configuration
const chainhookConfig = {
  name: 'sbtc-lending-monitor',
  version: 1,
  chains: {
    stacks: {
      network: NETWORK,
      start_block: 'latest', // Start from latest block or specify deployment block
      predicate: {
        scope: 'contract_call',
        contract_identifier: CONTRACT_ADDRESS,
        method: '*', // Monitor all methods
      },
      action: {
        http_post: {
          url: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook',
          authorization_header: process.env.WEBHOOK_AUTH || 'Bearer YOUR_TOKEN',
        },
      },
    },
  },
};

// Event handlers
const eventHandlers = {
  'collateral-approved': (event) => {
    console.log('🔐 Collateral Approved:', {
      tokenContract: event['token-contract'],
      tokenName: event['token-name'],
      ltvRatio: event['ltv-ratio'],
      timestamp: event.timestamp,
    });
  },

  'loan-created': (event) => {
    console.log('💰 Loan Created:', {
      loanId: event['loan-id'],
      borrower: event.borrower,
      collateralAmount: event['collateral-amount'],
      borrowedAmount: event['borrowed-amount'],
      interestRate: event['interest-rate'],
      timestamp: event.timestamp,
    });
  },

  'loan-repaid': (event) => {
    console.log('💳 Loan Repaid:', {
      loanId: event['loan-id'],
      borrower: event.borrower,
      amount: event.amount,
      interestPaid: event['interest-paid'],
      principalPaid: event['principal-paid'],
      remainingDebt: event['remaining-debt'],
      fullyRepaid: event['fully-repaid'],
      timestamp: event.timestamp,
    });
  },

  'collateral-added': (event) => {
    console.log('➕ Collateral Added:', {
      loanId: event['loan-id'],
      borrower: event.borrower,
      amount: event.amount,
      newTotalCollateral: event['new-total-collateral'],
      timestamp: event.timestamp,
    });
  },

  'loan-liquidated': (event) => {
    console.log('⚠️  Loan Liquidated:', {
      loanId: event['loan-id'],
      borrower: event.borrower,
      liquidator: event.liquidator,
      debtPaid: event['debt-paid'],
      collateralReceived: event['collateral-received'],
      healthFactor: event['health-factor'],
      timestamp: event.timestamp,
    });
  },

  'price-updated': (event) => {
    console.log('📊 Price Updated:', {
      oldPrice: event['old-price'],
      newPrice: event['new-price'],
      timestamp: event.timestamp,
    });
  },
};

// Main listener function
async function startListener() {
  console.log('=' .repeat(70));
  console.log('🔗 Hiro Chainhooks Listener - sbtc-lending');
  console.log('=' .repeat(70));
  console.log();
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Network:  ${NETWORK}`);
  console.log();
  console.log('Monitoring events:');
  Object.keys(eventHandlers).forEach((event) => {
    console.log(`  ✓ ${event}`);
  });
  console.log();
  console.log('=' .repeat(70));
  console.log();

  try {
    // Initialize chainhooks client
    const client = new ChainhookClient({
      baseUrl: process.env.CHAINHOOKS_URL || 'https://api.hiro.so',
    });

    // Process incoming events
    const processEvent = async (event) => {
      try {
        // Extract print events from transaction
        if (event.type === 'print_event' && event.contract_identifier === CONTRACT_ADDRESS) {
          const eventData = event.value;
          const eventType = eventData.event;

          if (eventHandlers[eventType]) {
            eventHandlers[eventType](eventData);
          } else {
            console.log('Unknown event:', eventType, eventData);
          }
        }
      } catch (error) {
        console.error('Error processing event:', error);
      }
    };

    console.log('✅ Listener started successfully');
    console.log('Waiting for events...');
    console.log();

    // Keep the process running
    setInterval(() => {
      // Heartbeat
    }, 60000);

  } catch (error) {
    console.error('❌ Error starting listener:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  chainhookConfig,
  eventHandlers,
  startListener,
};

// Start if run directly
if (require.main === module) {
  startListener().catch(console.error);
}
