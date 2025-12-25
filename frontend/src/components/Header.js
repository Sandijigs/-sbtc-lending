import React from 'react';
import './Header.css';

const Header = ({ userData, onConnect, onDisconnect, isConnecting }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substr(0, 6)}...${address.substr(-4)}`;
  };

  const getAddress = () => {
    if (!userData) return null;
    if (userData.profile?.stxAddress?.testnet) {
      return userData.profile.stxAddress.testnet;
    }
    if (userData.address) {
      return userData.address;
    }
    return null;
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🏦</span>
          <span className="logo-text">sBTC Lending</span>
        </div>

        <nav className="nav-menu">
          <a href="#lend" className="nav-link">Lend</a>
          <a href="#borrow" className="nav-link">Borrow</a>
          <a href="#positions" className="nav-link">Positions</a>
          <a href="#liquidations" className="nav-link">Liquidations</a>
          <a href="#docs" className="nav-link">Docs</a>
        </nav>

        <div className="wallet-section">
          {userData ? (
            <div className="wallet-connected">
              <div className="wallet-address">
                {formatAddress(getAddress())}
              </div>
              <button className="disconnect-btn" onClick={onDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button
              className={`connect-wallet-btn ${isConnecting ? 'loading' : ''}`}
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;