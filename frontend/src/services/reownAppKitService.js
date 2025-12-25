// reownAppKitService.js - Reown AppKit Integration for sBTC Lending
// Week 3 Builder Challenge - Reown AppKit Implementation

import { WALLET_CONNECT_PROJECT_ID, APP_METADATA, REOWN_CONFIG, trackWalletEvent } from '../config/walletConfig';

class ReownAppKitService {
  constructor() {
    this.projectId = WALLET_CONNECT_PROJECT_ID;
    this.metadata = APP_METADATA;
    this.config = REOWN_CONFIG;
    this.appKit = null;
    this.account = null;
    this.isInitialized = false;
    this.listeners = new Map();
    this.protocol = 'sbtc-lending';
    this.theme = 'dark';
  }

  async initialize() {
    if (this.isInitialized) {
      return this.appKit;
    }

    try {
      console.log('🚀 Initializing Reown AppKit for sBTC Lending...');
      console.log('🆔 Project ID:', this.projectId);

      // Mock implementation for development
      // In production, this would import actual Reown AppKit
      this.appKit = {
        projectId: this.projectId,
        metadata: this.metadata,
        config: this.config,
        protocol: this.protocol,
        theme: this.theme,
        features: {
          email: true,
          social: true,
          walletConnect: true,
          injected: true
        },
        chains: ['stacks:testnet'],
        connected: false,
        account: null
      };

      // Configure modal
      this.configureModal();

      // Track initialization
      trackWalletEvent('reown_initialized', {
        sdk: 'reown',
        protocol: this.protocol,
        projectId: this.projectId,
        features: Object.keys(this.appKit.features)
      });

      this.isInitialized = true;
      console.log('✅ Reown AppKit initialized for sBTC Lending');

      // Restore session if exists
      this.restoreSession();

      return this.appKit;
    } catch (error) {
      console.error('❌ Failed to initialize Reown AppKit:', error);
      throw error;
    }
  }

  configureModal() {
    this.modalConfig = {
      theme: {
        mode: this.theme,
        variables: {
          '--w3m-color-primary': '#FF6B35',
          '--w3m-color-secondary': '#F59E0B',
          '--w3m-border-radius': '12px'
        }
      },
      enableExplorer: true,
      enableAccountView: true,
      enableNetworkView: true,
      features: {
        lending: true,
        borrowing: true,
        liquidation: true
      },
      chains: {
        'stacks:testnet': {
          name: 'Stacks Testnet',
          icon: '⚡',
          rpc: 'https://api.testnet.hiro.so'
        }
      }
    };
  }

  async connect(method = 'modal') {
    await this.initialize();

    try {
      console.log('🔗 Connecting via Reown AppKit...');
      console.log('📱 Method:', method);

      // Track connection attempt
      trackWalletEvent('reown_connection_attempt', {
        sdk: 'reown',
        method,
        protocol: this.protocol
      });

      let account;

      switch (method) {
        case 'email':
          account = await this.connectViaEmail();
          break;
        case 'social':
          account = await this.connectViaSocial();
          break;
        case 'wallet':
          account = await this.connectViaWallet();
          break;
        default:
          account = await this.showModal();
      }

      // Store account
      this.account = account;
      this.appKit.connected = true;
      this.appKit.account = account;

      // Track successful connection
      trackWalletEvent('wallet_connected', {
        sdk: 'reown',
        method: account.method || method,
        address: account.address,
        protocol: this.protocol,
        projectId: this.projectId
      });

      // Save session
      this.saveSession();

      console.log('✅ Reown AppKit connected');
      console.log('👤 Account:', account);

      // Emit connection event
      this.emit('connected', account);

      return account;
    } catch (error) {
      console.error('❌ Reown AppKit connection failed:', error);

      trackWalletEvent('reown_connection_failed', {
        sdk: 'reown',
        method,
        error: error.message,
        protocol: this.protocol
      });

      throw error;
    }
  }

  async showModal() {
    console.log('🪟 Opening Reown modal...');

    // Simulate modal interaction
    await this.simulateModalInteraction();

    return {
      address: this.generateMockAddress(),
      method: 'modal',
      provider: 'reown',
      connected: true,
      protocol: this.protocol
    };
  }

  async connectViaEmail(email = 'user@sbtc-lending.com') {
    console.log('📧 Connecting via email:', email);

    // Track email connection
    trackWalletEvent('reown_email_attempt', {
      sdk: 'reown',
      protocol: this.protocol
    });

    // Simulate email verification
    await this.simulateEmailVerification();

    return {
      address: this.generateMockAddress(),
      email,
      method: 'email',
      provider: 'reown',
      connected: true,
      protocol: this.protocol
    };
  }

  async connectViaSocial(provider = 'google') {
    console.log('🌐 Connecting via social:', provider);

    // Track social connection
    trackWalletEvent('reown_social_attempt', {
      sdk: 'reown',
      provider,
      protocol: this.protocol
    });

    // Simulate OAuth flow
    await this.simulateOAuthFlow(provider);

    return {
      address: this.generateMockAddress(),
      socialProvider: provider,
      method: 'social',
      provider: 'reown',
      connected: true,
      protocol: this.protocol
    };
  }

  async connectViaWallet() {
    console.log('👛 Connecting via wallet...');

    // Simulate wallet connection
    await this.simulateWalletConnection();

    return {
      address: this.generateMockAddress(),
      method: 'wallet',
      provider: 'reown',
      walletName: 'Hiro Wallet',
      connected: true,
      protocol: this.protocol
    };
  }

  async disconnect() {
    if (!this.account) {
      return;
    }

    try {
      console.log('🔌 Disconnecting Reown AppKit...');

      trackWalletEvent('wallet_disconnected', {
        sdk: 'reown',
        address: this.account?.address,
        method: this.account?.method,
        protocol: this.protocol
      });

      // Clear account
      this.account = null;
      this.appKit.connected = false;
      this.appKit.account = null;

      // Clear stored session
      this.clearSession();

      console.log('✅ Reown AppKit disconnected');

      // Emit disconnection event
      this.emit('disconnected', null);
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      throw error;
    }
  }

  async signTransaction(transaction) {
    if (!this.account) {
      throw new Error('No active Reown AppKit session');
    }

    try {
      console.log('✍️ Signing transaction via Reown AppKit...');
      console.log('📝 Transaction type:', transaction.type);

      // Track transaction
      trackWalletEvent('transaction_sign_request', {
        sdk: 'reown',
        type: transaction.type,
        protocol: this.protocol,
        amount: transaction.amount,
        asset: transaction.asset || 'STX'
      });

      // Show transaction approval modal
      await this.showTransactionModal(transaction);

      // Simulate transaction signing
      const signedTx = {
        ...transaction,
        signature: this.generateMockSignature(),
        signedAt: Date.now(),
        signer: this.account.address
      };

      // Calculate fee
      const fee = this.calculateTransactionFee(transaction);

      // Track successful signing
      trackWalletEvent('transaction_submitted', {
        sdk: 'reown',
        method: 'reown',
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
        sdk: 'reown',
        error: error.message,
        protocol: this.protocol
      });

      throw error;
    }
  }

  // Lending protocol specific methods

  async supplyCollateral(amount, asset = 'sBTC') {
    const transaction = {
      type: 'supply_collateral',
      amount,
      asset,
      protocol: this.protocol,
      function: 'supply-collateral'
    };

    return this.signTransaction(transaction);
  }

  async borrowAsset(amount, asset = 'xUSD', collateralAsset = 'sBTC') {
    const transaction = {
      type: 'borrow_asset',
      amount,
      asset,
      collateralAsset,
      protocol: this.protocol,
      function: 'borrow'
    };

    return this.signTransaction(transaction);
  }

  async repayBorrow(amount, loanId) {
    const transaction = {
      type: 'repay_borrow',
      amount,
      loanId,
      protocol: this.protocol,
      function: 'repay-borrow'
    };

    return this.signTransaction(transaction);
  }

  async withdrawCollateral(amount, asset = 'sBTC') {
    const transaction = {
      type: 'withdraw_collateral',
      amount,
      asset,
      protocol: this.protocol,
      function: 'withdraw-collateral'
    };

    return this.signTransaction(transaction);
  }

  async enableAsCollateral(asset = 'sBTC') {
    const transaction = {
      type: 'enable_as_collateral',
      asset,
      protocol: this.protocol,
      function: 'enable-as-collateral'
    };

    return this.signTransaction(transaction);
  }

  // Helper methods

  calculateTransactionFee(transaction) {
    // Base fee + complexity multiplier
    const baseFee = 0.001;
    const complexityMultiplier = {
      'supply_collateral': 1.2,
      'borrow_asset': 1.5,
      'repay_borrow': 1.3,
      'withdraw_collateral': 1.2,
      'enable_as_collateral': 1,
      'liquidation': 2
    };

    return baseFee * (complexityMultiplier[transaction.type] || 1);
  }

  async showTransactionModal(transaction) {
    console.log('📋 Transaction Review:');
    console.log('  Protocol:', this.protocol);
    console.log('  Type:', transaction.type);
    console.log('  Amount:', transaction.amount, transaction.asset || 'STX');

    if (transaction.collateralAsset) {
      console.log('  Collateral:', transaction.collateralAsset);
    }

    // Simulate user approval
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ Transaction approved by user');
        resolve();
      }, 1000);
    });
  }

  async switchNetwork(chainId) {
    console.log('🔄 Switching network to:', chainId);

    trackWalletEvent('network_switch', {
      sdk: 'reown',
      fromChain: this.appKit.chains[0],
      toChain: chainId,
      protocol: this.protocol
    });

    this.appKit.chains = [chainId];
    console.log('✅ Network switched');
  }

  // Account management

  getAccount() {
    if (!this.account) {
      this.restoreSession();
    }
    return this.account;
  }

  isConnected() {
    return this.appKit?.connected && this.account !== null;
  }

  getAddress() {
    return this.account?.address || null;
  }

  setTheme(theme) {
    this.theme = theme;
    if (this.appKit) {
      this.appKit.theme = theme;
      this.configureModal();
    }
  }

  // Event handling

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

  // Simulation methods

  simulateModalInteraction() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('👆 User selected connection method');
        resolve();
      }, 1500);
    });
  }

  simulateEmailVerification() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✉️ Email verified successfully');
        resolve();
      }, 2000);
    });
  }

  simulateOAuthFlow(provider) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`🔐 OAuth authentication complete for ${provider}`);
        resolve();
      }, 2000);
    });
  }

  simulateWalletConnection() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('👛 Wallet connected successfully');
        resolve();
      }, 1000);
    });
  }

  // Session management

  saveSession() {
    if (this.account) {
      const session = {
        account: this.account,
        timestamp: Date.now(),
        projectId: this.projectId,
        protocol: this.protocol
      };
      localStorage.setItem('reown_session_sbtc', JSON.stringify(session));
    }
  }

  restoreSession() {
    try {
      const stored = localStorage.getItem('reown_session_sbtc');
      if (stored) {
        const session = JSON.parse(stored);

        // Check if session is recent (within 24 hours)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          this.account = session.account;
          if (this.appKit) {
            this.appKit.connected = true;
            this.appKit.account = session.account;
          }

          console.log('🔄 Reown session restored for sBTC Lending');
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
    localStorage.removeItem('reown_session_sbtc');
  }

  // Metrics

  getMetrics() {
    const events = JSON.parse(localStorage.getItem('wallet_events') || '[]');
    const reownEvents = events.filter(e => e.sdk === 'reown' && e.protocol === 'sbtc-lending');

    const fees = reownEvents
      .filter(e => e.fee)
      .reduce((sum, e) => sum + parseFloat(e.fee), 0);

    return {
      totalConnections: reownEvents.filter(e => e.event === 'wallet_connected').length,
      totalTransactions: reownEvents.filter(e => e.event === 'transaction_submitted').length,
      uniqueUsers: new Set(reownEvents.filter(e => e.address).map(e => e.address)).size,
      totalFeesGenerated: fees,
      connectionMethods: {
        email: reownEvents.filter(e => e.method === 'email').length,
        social: reownEvents.filter(e => e.method === 'social').length,
        wallet: reownEvents.filter(e => e.method === 'wallet').length,
        modal: reownEvents.filter(e => e.method === 'modal').length
      },
      transactionTypes: {
        supply: reownEvents.filter(e => e.type === 'supply_collateral').length,
        borrow: reownEvents.filter(e => e.type === 'borrow_asset').length,
        repay: reownEvents.filter(e => e.type === 'repay_borrow').length,
        withdraw: reownEvents.filter(e => e.type === 'withdraw_collateral').length
      },
      lastActivity: reownEvents.length > 0 ?
        reownEvents[reownEvents.length - 1].timestamp : null
    };
  }
}

// Export singleton instance
export const reownAppKit = new ReownAppKitService();

// Export class for testing
export default ReownAppKitService;