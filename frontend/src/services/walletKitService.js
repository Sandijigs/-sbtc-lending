// walletKitService.js - WalletKit SDK Integration for sBTC Lending
// Week 3 Builder Challenge - WalletKit SDK Implementation

import { WALLET_CONNECT_PROJECT_ID, APP_METADATA, trackWalletEvent } from '../config/walletConfig';

class WalletKitService {
  constructor() {
    this.projectId = WALLET_CONNECT_PROJECT_ID;
    this.metadata = APP_METADATA;
    this.session = null;
    this.client = null;
    this.isInitialized = false;
    this.listeners = new Map();
    this.protocol = 'sbtc-lending';
  }

  async initialize() {
    if (this.isInitialized) {
      return this.client;
    }

    try {
      console.log('🔌 Initializing WalletKit SDK for sBTC Lending...');
      console.log('📋 Project ID:', this.projectId);

      // Mock implementation for development
      // In production, this would import actual WalletKit SDK
      this.client = {
        projectId: this.projectId,
        metadata: this.metadata,
        protocol: this.protocol,
        connected: false,
        accounts: [],
        chainId: 'stacks:testnet'
      };

      // Track initialization
      trackWalletEvent('walletkit_initialized', {
        sdk: 'walletkit',
        protocol: this.protocol,
        projectId: this.projectId
      });

      this.isInitialized = true;
      console.log('✅ WalletKit SDK initialized for sBTC Lending');

      // Restore session if exists
      this.restoreSession();

      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize WalletKit SDK:', error);
      throw error;
    }
  }

  async connect(options = {}) {
    await this.initialize();

    try {
      console.log('🔗 Connecting via WalletKit SDK...');

      // Track connection attempt
      trackWalletEvent('walletkit_connection_attempt', {
        sdk: 'walletkit',
        protocol: this.protocol,
        ...options
      });

      // Generate pairing URI
      const pairingUri = this.generatePairingUri();
      console.log('🔐 Pairing URI:', pairingUri);

      // Simulate connection process
      await this.simulateConnection();

      // Create session
      const address = this.generateMockAddress();
      this.session = {
        topic: this.generateSessionTopic(),
        accounts: [`stacks:testnet:${address}`],
        expiry: Date.now() + (7 * 24 * 60 * 60 * 1000),
        acknowledged: true,
        pairingUri,
        address
      };

      this.client.connected = true;
      this.client.accounts = this.session.accounts;

      // Track successful connection
      trackWalletEvent('wallet_connected', {
        sdk: 'walletkit',
        method: 'walletkit',
        address: this.session.address,
        protocol: this.protocol,
        projectId: this.projectId
      });

      // Save session
      this.saveSession();

      console.log('✅ WalletKit connected to sBTC Lending');
      console.log('📱 Address:', this.session.address);

      // Emit connection event
      this.emit('connected', this.session);

      return this.session;
    } catch (error) {
      console.error('❌ WalletKit connection failed:', error);

      trackWalletEvent('walletkit_connection_failed', {
        sdk: 'walletkit',
        error: error.message,
        protocol: this.protocol
      });

      throw error;
    }
  }

  async disconnect() {
    if (!this.session) {
      return;
    }

    try {
      console.log('🔌 Disconnecting WalletKit...');

      trackWalletEvent('wallet_disconnected', {
        sdk: 'walletkit',
        address: this.session?.address,
        protocol: this.protocol
      });

      // Clear session
      this.session = null;
      this.client.connected = false;
      this.client.accounts = [];

      // Clear stored session
      this.clearSession();

      // Emit disconnection event
      this.emit('disconnected', null);

      console.log('✅ WalletKit disconnected');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      throw error;
    }
  }

  async signTransaction(transaction) {
    if (!this.session) {
      throw new Error('No active WalletKit session');
    }

    try {
      console.log('✍️ Signing transaction for sBTC Lending...');
      console.log('📝 Transaction type:', transaction.type);

      // Track transaction
      trackWalletEvent('transaction_sign_request', {
        sdk: 'walletkit',
        type: transaction.type,
        protocol: this.protocol,
        amount: transaction.amount,
        asset: transaction.asset || 'STX'
      });

      // Simulate signing
      const signedTx = {
        ...transaction,
        signature: this.generateMockSignature(),
        signedAt: Date.now(),
        signer: this.session.address
      };

      // Calculate fee
      const fee = this.calculateTransactionFee(transaction);

      // Track successful signing
      trackWalletEvent('transaction_submitted', {
        sdk: 'walletkit',
        method: 'walletkit',
        txId: signedTx.signature.slice(0, 10),
        type: transaction.type,
        protocol: this.protocol,
        fee: fee.toString(),
        amount: transaction.amount,
        asset: transaction.asset || 'STX'
      });

      console.log('✅ Transaction signed:', signedTx.signature);
      console.log('💰 Fee:', fee, 'STX');

      return signedTx;
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);

      trackWalletEvent('transaction_sign_failed', {
        sdk: 'walletkit',
        error: error.message,
        protocol: this.protocol
      });

      throw error;
    }
  }

  // Lending protocol specific methods

  async approveLending(amount, asset = 'sBTC') {
    const transaction = {
      type: 'approve_lending',
      amount,
      asset,
      protocol: this.protocol,
      function: 'approve-lending'
    };

    return this.signTransaction(transaction);
  }

  async createLoan(collateralAmount, borrowAmount, collateralAsset = 'sBTC', borrowAsset = 'xUSD') {
    const transaction = {
      type: 'create_loan',
      collateralAmount,
      borrowAmount,
      collateralAsset,
      borrowAsset,
      protocol: this.protocol,
      function: 'create-loan'
    };

    return this.signTransaction(transaction);
  }

  async repayLoan(loanId, amount) {
    const transaction = {
      type: 'repay_loan',
      loanId,
      amount,
      protocol: this.protocol,
      function: 'repay-loan'
    };

    return this.signTransaction(transaction);
  }

  async liquidate(loanId) {
    const transaction = {
      type: 'liquidate',
      loanId,
      protocol: this.protocol,
      function: 'liquidate'
    };

    return this.signTransaction(transaction);
  }

  // Helper methods

  calculateTransactionFee(transaction) {
    // Base fee + complexity multiplier
    const baseFee = 0.001;
    const complexityMultiplier = {
      'approve_lending': 1,
      'create_loan': 1.5,
      'repay_loan': 1.2,
      'liquidate': 2
    };

    return baseFee * (complexityMultiplier[transaction.type] || 1);
  }

  getSession() {
    if (!this.session) {
      this.restoreSession();
    }
    return this.session;
  }

  isConnected() {
    return this.client?.connected && this.session !== null;
  }

  getAddress() {
    return this.session?.address || null;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  // Mock data generation

  generatePairingUri() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `wc:${random}${timestamp}@2?relay-protocol=irn&symKey=${random}`;
  }

  generateSessionTopic() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  generateMockAddress() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let address = 'ST';
    for (let i = 0; i < 38; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  generateMockSignature() {
    const chars = '0123456789abcdef';
    let signature = '0x';
    for (let i = 0; i < 64; i++) {
      signature += chars[Math.floor(Math.random() * chars.length)];
    }
    return signature;
  }

  simulateConnection() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📱 Simulating wallet approval...');
        resolve();
      }, 1500);
    });
  }

  // Session management

  saveSession() {
    if (this.session) {
      const sessionData = {
        ...this.session,
        protocol: this.protocol,
        savedAt: Date.now()
      };
      localStorage.setItem('walletkit_session_sbtc', JSON.stringify(sessionData));
    }
  }

  restoreSession() {
    try {
      const stored = localStorage.getItem('walletkit_session_sbtc');
      if (stored) {
        const session = JSON.parse(stored);

        // Check if session is still valid
        if (session.expiry > Date.now()) {
          this.session = session;
          this.client = this.client || {};
          this.client.connected = true;
          this.client.accounts = session.accounts;

          console.log('🔄 WalletKit session restored for sBTC Lending');
          return true;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearSession();
    }
    return false;
  }

  clearSession() {
    localStorage.removeItem('walletkit_session_sbtc');
  }

  // Metrics

  getMetrics() {
    const events = JSON.parse(localStorage.getItem('wallet_events') || '[]');
    const walletkitEvents = events.filter(e => e.sdk === 'walletkit' && e.protocol === 'sbtc-lending');

    return {
      totalConnections: walletkitEvents.filter(e => e.event === 'wallet_connected').length,
      totalTransactions: walletkitEvents.filter(e => e.event === 'transaction_submitted').length,
      totalFees: walletkitEvents
        .filter(e => e.fee)
        .reduce((sum, e) => sum + parseFloat(e.fee), 0),
      transactionTypes: {
        lending: walletkitEvents.filter(e => e.type === 'approve_lending').length,
        loans: walletkitEvents.filter(e => e.type === 'create_loan').length,
        repayments: walletkitEvents.filter(e => e.type === 'repay_loan').length,
        liquidations: walletkitEvents.filter(e => e.type === 'liquidate').length
      },
      lastActivity: walletkitEvents.length > 0 ?
        walletkitEvents[walletkitEvents.length - 1].timestamp : null
    };
  }
}

// Export singleton instance
export const walletKit = new WalletKitService();

// Export class for testing
export default WalletKitService;