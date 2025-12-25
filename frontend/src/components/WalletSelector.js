import React from 'react';
import './WalletSelector.css';

const WalletSelector = ({ onClose, onConnect }) => {
  const handleWalletSelect = (walletType) => {
    onConnect(walletType);
    onClose();
  };

  return (
    <div className="wallet-selector-overlay" onClick={onClose}>
      <div className="wallet-selector-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>Connect Wallet</h2>
          <p>Choose your preferred wallet connection method</p>
        </div>

        {/* Week 3 Challenge Banner */}
        <div className="challenge-banner">
          <h3>🏆 Week 3 Builder Challenge</h3>
          <div className="challenge-metrics">
            <div>WalletKit SDK: ✅ Integrated</div>
            <div>Reown AppKit: ✅ Integrated</div>
          </div>
          <div className="project-id">
            WalletConnect Project ID: 973aec75d9c96397c8ccd94d62bada81
          </div>
        </div>

        <div className="wallet-options">
          <div className="section-header">Recommended Wallets</div>

          <button
            className="wallet-option"
            onClick={() => handleWalletSelect('hiro')}
          >
            <div className="wallet-icon">
              <span className="icon-emoji">🟣</span>
            </div>
            <div className="wallet-info">
              <div className="wallet-name">Hiro Wallet</div>
              <div className="wallet-description">The most popular Stacks wallet</div>
            </div>
            <div className="wallet-badge recommended">Recommended</div>
          </button>

          <button
            className="wallet-option"
            onClick={() => handleWalletSelect('xverse')}
          >
            <div className="wallet-icon">
              <span className="icon-emoji">🔷</span>
            </div>
            <div className="wallet-info">
              <div className="wallet-name">Xverse</div>
              <div className="wallet-description">Bitcoin & Stacks wallet</div>
            </div>
          </button>

          <button
            className="wallet-option"
            onClick={() => handleWalletSelect('leather')}
          >
            <div className="wallet-icon">
              <span className="icon-emoji">🟠</span>
            </div>
            <div className="wallet-info">
              <div className="wallet-name">Leather</div>
              <div className="wallet-description">Previously Hiro Wallet</div>
            </div>
          </button>

          <div className="section-header">Advanced Connection Methods</div>

          <button
            className="wallet-option advanced"
            onClick={() => handleWalletSelect('walletkit')}
          >
            <div className="wallet-icon gradient-bg">
              <span className="icon-text">WK</span>
            </div>
            <div className="wallet-info">
              <div className="wallet-name">WalletKit SDK</div>
              <div className="wallet-description">Connect via WalletConnect protocol</div>
            </div>
            <div className="wallet-badge new">NEW</div>
          </button>

          <button
            className="wallet-option advanced"
            onClick={() => handleWalletSelect('reown')}
          >
            <div className="wallet-icon gradient-bg">
              <span className="icon-text">RA</span>
            </div>
            <div className="wallet-info">
              <div className="wallet-name">Reown AppKit</div>
              <div className="wallet-description">Next-gen wallet with social login</div>
            </div>
            <div className="wallet-badge new">NEW</div>
          </button>
        </div>

        <div className="modal-footer">
          <p>
            <a href="https://docs.stacks.co/connect" target="_blank" rel="noopener noreferrer">
              Learn more about wallet connections →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletSelector;