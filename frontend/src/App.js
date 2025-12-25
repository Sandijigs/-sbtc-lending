import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { UserSession, AppConfig, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  stringAsciiCV
} from '@stacks/transactions';

// Components
import Header from './components/Header';
import LendingDashboard from './components/LendingDashboard';
import BorrowingInterface from './components/BorrowingInterface';
import PositionManager from './components/PositionManager';
import LiquidationMonitor from './components/LiquidationMonitor';
import Stats from './components/Stats';
import WalletSelector from './components/WalletSelector';

// Services
import { walletKit } from './services/walletKitService';
import { reownAppKit } from './services/reownAppKitService';

// Config
import { CONTRACT_CONFIG, LENDING_CONFIG, trackWalletEvent, getWalletMetrics } from './config/walletConfig';

// Initialize Stacks
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet();

// Contract details
const CONTRACT_ADDRESS = CONTRACT_CONFIG.testnet.address;
const CONTRACT_NAME = CONTRACT_CONFIG.testnet.name;

function App() {
  // State management
  const [userData, setUserData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('lend');
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(null);

  // Lending state
  const [userPositions, setUserPositions] = useState([]);
  const [marketData, setMarketData] = useState({
    totalSupplied: {},
    totalBorrowed: {},
    utilizationRates: {},
    supplyAPYs: {},
    borrowAPYs: {}
  });
  const [metrics, setMetrics] = useState(getWalletMetrics());

  // Check if user is signed in
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
      loadUserPositions(userData.profile.stxAddress.testnet);
      trackWalletEvent('wallet_connected', {
        method: 'standard',
        address: userData.profile.stxAddress.testnet
      });
    }
  }, []);

  // Load user positions
  const loadUserPositions = async (address) => {
    try {
      // Mock positions for demo
      const positions = [
        {
          asset: 'sBTC',
          type: 'collateral',
          amount: 1.5,
          value: 45000,
          apy: 3.2
        },
        {
          asset: 'xUSD',
          type: 'borrowed',
          amount: 20000,
          value: 20000,
          apy: 5.8
        }
      ];
      setUserPositions(positions);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  // Load market data
  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      // Mock market data for demo
      setMarketData({
        totalSupplied: {
          sBTC: 125.5,
          STX: 1500000,
          xUSD: 450000
        },
        totalBorrowed: {
          sBTC: 45.2,
          STX: 500000,
          xUSD: 350000
        },
        utilizationRates: {
          sBTC: 0.36,
          STX: 0.33,
          xUSD: 0.78
        },
        supplyAPYs: {
          sBTC: 3.2,
          STX: 2.8,
          xUSD: 4.5
        },
        borrowAPYs: {
          sBTC: 5.8,
          STX: 6.2,
          xUSD: 7.1
        }
      });
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  };

  // Connect wallet handlers
  const connectWallet = () => {
    setShowWalletSelector(true);
  };

  const handleWalletConnect = async (method) => {
    setIsConnecting(true);
    setConnectionMethod(method);

    try {
      switch (method) {
        case 'hiro':
        case 'xverse':
        case 'leather':
          // Standard Stacks Connect
          showConnect({
            appDetails: {
              name: 'sBTC Lending Protocol',
              icon: window.location.origin + '/logo.png',
            },
            redirectTo: '/',
            onFinish: () => {
              const userData = userSession.loadUserData();
              setUserData(userData);
              loadUserPositions(userData.profile.stxAddress.testnet);
              trackWalletEvent('wallet_connected', {
                method: 'standard',
                wallet: method,
                address: userData.profile.stxAddress.testnet
              });
              setMetrics(getWalletMetrics());
            },
            userSession,
          });
          break;

        case 'walletkit':
          // WalletKit SDK connection
          const wkSession = await walletKit.connect();
          setUserData({
            profile: { stxAddress: { testnet: wkSession.address } }
          });
          loadUserPositions(wkSession.address);
          setMetrics(getWalletMetrics());
          break;

        case 'reown':
          // Reown AppKit connection
          const reownAccount = await reownAppKit.connect();
          setUserData({
            profile: { stxAddress: { testnet: reownAccount.address } }
          });
          loadUserPositions(reownAccount.address);
          setMetrics(getWalletMetrics());
          break;

        default:
          console.error('Unknown wallet method:', method);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
      setShowWalletSelector(false);
    }
  };

  const disconnectWallet = async () => {
    if (connectionMethod === 'walletkit') {
      await walletKit.disconnect();
    } else if (connectionMethod === 'reown') {
      await reownAppKit.disconnect();
    } else if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }

    setUserData(null);
    setUserPositions([]);
    setConnectionMethod(null);
    trackWalletEvent('wallet_disconnected', {
      method: connectionMethod || 'standard'
    });
    setMetrics(getWalletMetrics());
  };

  // Lending operations
  const supplyAsset = async (asset, amount) => {
    if (!userData) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      console.log(`Supplying ${amount} ${asset}`);

      // Track the transaction
      trackWalletEvent('transaction_submitted', {
        type: 'supply',
        asset,
        amount,
        fee: 0.001
      });

      // Update metrics
      setMetrics(getWalletMetrics());

      // Reload positions
      await loadUserPositions(userData.profile.stxAddress.testnet);

      alert(`Successfully supplied ${amount} ${asset}`);
    } catch (error) {
      console.error('Supply error:', error);
      alert('Failed to supply asset: ' + error.message);
    }
  };

  const borrowAsset = async (asset, amount) => {
    if (!userData) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      console.log(`Borrowing ${amount} ${asset}`);

      // Track the transaction
      trackWalletEvent('transaction_submitted', {
        type: 'borrow',
        asset,
        amount,
        fee: 0.0015
      });

      // Update metrics
      setMetrics(getWalletMetrics());

      // Reload positions
      await loadUserPositions(userData.profile.stxAddress.testnet);

      alert(`Successfully borrowed ${amount} ${asset}`);
    } catch (error) {
      console.error('Borrow error:', error);
      alert('Failed to borrow asset: ' + error.message);
    }
  };

  const repayLoan = async (asset, amount) => {
    if (!userData) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      console.log(`Repaying ${amount} ${asset}`);

      // Track the transaction
      trackWalletEvent('transaction_submitted', {
        type: 'repay',
        asset,
        amount,
        fee: 0.001
      });

      // Update metrics
      setMetrics(getWalletMetrics());

      // Reload positions
      await loadUserPositions(userData.profile.stxAddress.testnet);

      alert(`Successfully repaid ${amount} ${asset}`);
    } catch (error) {
      console.error('Repay error:', error);
      alert('Failed to repay loan: ' + error.message);
    }
  };

  return (
    <div className="App">
      <Header
        userData={userData}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        isConnecting={isConnecting}
      />

      {/* Week 3 Challenge Banner */}
      <div className="challenge-banner">
        <div className="banner-content">
          <h3>🏆 Week 3 Builder Challenge Active</h3>
          <div className="challenge-stats">
            <div className="stat">
              <span className="label">WalletKit SDK:</span>
              <span className="value">✅ Integrated</span>
            </div>
            <div className="stat">
              <span className="label">Reown AppKit:</span>
              <span className="value">✅ Integrated</span>
            </div>
            <div className="stat">
              <span className="label">Users Connected:</span>
              <span className="value">{metrics.uniqueWallets || 0}</span>
            </div>
            <div className="stat">
              <span className="label">Fees Generated:</span>
              <span className="value">{metrics.totalFeesGenerated?.toFixed(4) || 0} STX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">sBTC Lending Protocol</span>
          </h1>
          <p className="hero-subtitle">
            Lend, borrow, and earn with Bitcoin on Stacks
          </p>

          {!userData && (
            <button className="hero-cta" onClick={connectWallet}>
              Connect Wallet to Start
            </button>
          )}
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'lend' ? 'active' : ''}`}
          onClick={() => setActiveTab('lend')}
        >
          Lend
        </button>
        <button
          className={`tab ${activeTab === 'borrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          Borrow
        </button>
        <button
          className={`tab ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          My Positions
        </button>
        <button
          className={`tab ${activeTab === 'liquidations' ? 'active' : ''}`}
          onClick={() => setActiveTab('liquidations')}
        >
          Liquidations
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'lend' && (
          <LendingDashboard
            marketData={marketData}
            onSupply={supplyAsset}
            userData={userData}
          />
        )}

        {activeTab === 'borrow' && (
          <BorrowingInterface
            marketData={marketData}
            userPositions={userPositions}
            onBorrow={borrowAsset}
            userData={userData}
          />
        )}

        {activeTab === 'positions' && (
          <PositionManager
            positions={userPositions}
            marketData={marketData}
            onRepay={repayLoan}
            userData={userData}
          />
        )}

        {activeTab === 'liquidations' && (
          <LiquidationMonitor
            marketData={marketData}
            userData={userData}
          />
        )}

        {activeTab === 'stats' && (
          <Stats
            marketData={marketData}
            metrics={metrics}
            contractAddress={CONTRACT_ADDRESS}
          />
        )}
      </main>

      {/* Wallet Selector Modal */}
      {showWalletSelector && (
        <WalletSelector
          onClose={() => setShowWalletSelector(false)}
          onConnect={handleWalletConnect}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Protocol</h4>
            <p>Contract: {CONTRACT_ADDRESS}</p>
            <p>Network: Stacks Testnet</p>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://docs.stacks.co" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
          <div className="footer-section">
            <h4>Week 3 Integration</h4>
            <p>WalletConnect ID: 973aec75d9c96397c8ccd94d62bada81</p>
            <p>SDKs: WalletKit + Reown AppKit</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;