// walletConfig.js - Wallet Configuration for Week 3 Builder Challenge
// Using the same WalletConnect Project ID as yield-vault

export const WALLET_CONNECT_PROJECT_ID = '973aec75d9c96397c8ccd94d62bada81';

export const APP_METADATA = {
  name: 'sBTC Lending Protocol',
  description: 'Decentralized lending and borrowing with Bitcoin on Stacks',
  url: 'https://sbtc-lending.stacks.app',
  icons: ['https://sbtc-lending.stacks.app/logo.png']
};

export const SUPPORTED_WALLETS = {
  HIRO: {
    name: 'Hiro Wallet',
    description: 'Official Stacks wallet',
    icon: '/wallet-icons.svg#hiro-wallet',
    recommended: true
  },
  XVERSE: {
    name: 'Xverse',
    description: 'Bitcoin & Stacks wallet',
    icon: '/wallet-icons.svg#xverse-wallet'
  },
  LEATHER: {
    name: 'Leather',
    description: 'Formerly Hiro wallet',
    icon: '/wallet-icons.svg#leather-wallet'
  },
  WALLETKIT: {
    name: 'WalletKit SDK',
    description: 'Connect via WalletConnect protocol',
    icon: '/wallet-icons.svg#walletkit-sdk',
    isAdvanced: true,
    badge: 'NEW'
  },
  REOWN: {
    name: 'Reown AppKit',
    description: 'Next-gen wallet connection with social login',
    icon: '/wallet-icons.svg#reown-appkit',
    isAdvanced: true,
    badge: 'NEW'
  }
};

export const REOWN_CONFIG = {
  projectId: WALLET_CONNECT_PROJECT_ID,
  features: {
    email: true,
    social: true,
    walletConnect: true,
    injected: true
  },
  socialProviders: ['google', 'github', 'discord', 'twitter'],
  theme: {
    mode: 'dark',
    variables: {
      '--w3m-color-primary': '#FF6B35',
      '--w3m-color-secondary': '#F59E0B',
      '--w3m-border-radius': '12px'
    }
  }
};

export const NETWORK_CONFIG = {
  testnet: {
    name: 'Stacks Testnet',
    url: 'https://api.testnet.hiro.so',
    chainId: 2147483648,
    networkId: 1
  },
  mainnet: {
    name: 'Stacks Mainnet',
    url: 'https://api.hiro.so',
    chainId: 1,
    networkId: 1
  }
};

// Contract addresses for sbtc-lending (Updated December 27, 2025)
export const CONTRACT_CONFIG = {
  testnet: {
    address: 'SP12KRGRZ2N2Q5B8HKXHETGRD0JVF282TAA3R3HXX',
    name: 'sbtc-lending',
    deploymentTx: '25651d7b1a29467c52d4438c5e9bb7842ca054befc4bb970d6870329c3bbe03e'
  },
  mainnet: {
    address: null, // To be deployed
    name: 'sbtc-lending'
  }
};

// Lending protocol specific configuration
export const LENDING_CONFIG = {
  supportedAssets: [
    {
      symbol: 'sBTC',
      name: 'Synthetic Bitcoin',
      decimals: 8,
      icon: '₿',
      color: '#F7931A'
    },
    {
      symbol: 'STX',
      name: 'Stacks',
      decimals: 6,
      icon: 'Ӿ',
      color: '#5546FF'
    },
    {
      symbol: 'xUSD',
      name: 'Synthetic USD',
      decimals: 6,
      icon: '$',
      color: '#22C55E'
    }
  ],
  collateralFactors: {
    sBTC: 0.75, // 75% LTV
    STX: 0.50,  // 50% LTV
    xUSD: 0.90  // 90% LTV
  },
  interestRateModel: {
    baseRate: 0.02,      // 2% base APY
    multiplier: 0.15,    // 15% slope
    jumpMultiplier: 2,   // 2x after kink
    kink: 0.80          // 80% utilization kink
  }
};

// Track wallet events for leaderboard metrics
export const trackWalletEvent = (eventName, eventData = {}) => {
  const event = {
    event: eventName,
    timestamp: Date.now(),
    projectId: WALLET_CONNECT_PROJECT_ID,
    protocol: 'sbtc-lending',
    ...eventData
  };

  // Store events in localStorage for analytics
  const events = JSON.parse(localStorage.getItem('wallet_events') || '[]');
  events.push(event);

  // Keep only last 500 events
  if (events.length > 500) {
    events.splice(0, events.length - 500);
  }

  localStorage.setItem('wallet_events', JSON.stringify(events));

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Wallet Event:', eventName, eventData);
  }

  return event;
};

// Get wallet metrics for display
export const getWalletMetrics = () => {
  const events = JSON.parse(localStorage.getItem('wallet_events') || '[]');

  const metrics = {
    totalConnections: events.filter(e => e.event === 'wallet_connected').length,
    uniqueWallets: [...new Set(events.filter(e => e.address).map(e => e.address))].length,
    totalTransactions: events.filter(e => e.event === 'transaction_submitted').length,
    totalFeesGenerated: events
      .filter(e => e.fee)
      .reduce((sum, e) => sum + parseFloat(e.fee), 0),
    connectionMethods: {
      standard: events.filter(e => e.method === 'standard').length,
      walletkit: events.filter(e => e.method === 'walletkit').length,
      reown: events.filter(e => e.method === 'reown').length
    },
    lastActivity: events.length > 0 ? events[events.length - 1].timestamp : null
  };

  return metrics;
};

// Export all configurations
export default {
  WALLET_CONNECT_PROJECT_ID,
  APP_METADATA,
  SUPPORTED_WALLETS,
  REOWN_CONFIG,
  NETWORK_CONFIG,
  CONTRACT_CONFIG,
  LENDING_CONFIG,
  trackWalletEvent,
  getWalletMetrics
};