import React, { useState } from 'react';

const BorrowingInterface = ({ marketData, userPositions, onBorrow, userData }) => {
  const [selectedAsset, setSelectedAsset] = useState('xUSD');
  const [borrowAmount, setBorrowAmount] = useState('');

  const handleBorrow = () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onBorrow(selectedAsset, parseFloat(borrowAmount));
    setBorrowAmount('');
  };

  const calculateHealthFactor = () => {
    // Calculate health factor based on collateral and borrowed amounts
    const totalCollateral = userPositions
      .filter(p => p.type === 'collateral')
      .reduce((sum, p) => sum + p.value, 0);

    const totalBorrowed = userPositions
      .filter(p => p.type === 'borrowed')
      .reduce((sum, p) => sum + p.value, 0);

    if (totalBorrowed === 0) return 999;
    return (totalCollateral * 0.75) / totalBorrowed;
  };

  const healthFactor = calculateHealthFactor();
  const healthColor = healthFactor > 2 ? '#22C55E' :
                     healthFactor > 1.5 ? '#F59E0B' : '#EF4444';

  const borrowAssets = [
    {
      symbol: 'xUSD',
      name: 'Synthetic USD',
      icon: '$',
      color: '#22C55E',
      totalBorrowed: marketData.totalBorrowed?.xUSD || 0,
      borrowAPY: marketData.borrowAPYs?.xUSD || 0,
      available: 100000
    },
    {
      symbol: 'sBTC',
      name: 'Synthetic Bitcoin',
      icon: '₿',
      color: '#F7931A',
      totalBorrowed: marketData.totalBorrowed?.sBTC || 0,
      borrowAPY: marketData.borrowAPYs?.sBTC || 0,
      available: 10
    },
    {
      symbol: 'STX',
      name: 'Stacks',
      icon: 'Ӿ',
      color: '#5546FF',
      totalBorrowed: marketData.totalBorrowed?.STX || 0,
      borrowAPY: marketData.borrowAPYs?.STX || 0,
      available: 50000
    }
  ];

  return (
    <div className="borrowing-interface">
      <div className="market-card">
        <h3>Borrow Assets</h3>
        <p style={{ color: '#888', marginBottom: '24px' }}>
          Borrow against your collateral at competitive rates
        </p>

        {userData && userPositions.length > 0 && (
          <div className="health-factor">
            <div className="health-label">Health Factor</div>
            <div className="health-bar">
              <div
                className="health-fill"
                style={{
                  width: `${Math.min(healthFactor / 3 * 100, 100)}%`,
                  background: healthColor
                }}
              />
            </div>
            <div className="health-value" style={{ color: healthColor }}>
              {healthFactor.toFixed(2)}
            </div>
          </div>
        )}

        <div className="asset-grid">
          {borrowAssets.map((asset) => (
            <div
              key={asset.symbol}
              className={`asset-card ${selectedAsset === asset.symbol ? 'selected' : ''}`}
              onClick={() => setSelectedAsset(asset.symbol)}
            >
              <div className="asset-header">
                <div className="asset-info">
                  <div
                    className="asset-icon"
                    style={{ background: asset.color }}
                  >
                    {asset.icon}
                  </div>
                  <div>
                    <div className="asset-name">{asset.name}</div>
                    <div className="asset-symbol">{asset.symbol}</div>
                  </div>
                </div>
                <div className="apy-badge" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444'
                }}>
                  {asset.borrowAPY}% APY
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Borrowed</div>
                  <div className="stat-value">
                    {asset.totalBorrowed.toLocaleString()} {asset.symbol}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Available</div>
                  <div className="stat-value">
                    {asset.available.toLocaleString()} {asset.symbol}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {userData && (
          <div className="borrow-form">
            <div className="collateral-info">
              <h4>Your Collateral</h4>
              {userPositions.filter(p => p.type === 'collateral').map((position, i) => (
                <div key={i} className="collateral-item">
                  <span>{position.amount} {position.asset}</span>
                  <span>${position.value.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="input-group">
              <label className="input-label">
                Borrow Amount ({selectedAsset})
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  className="input-field"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                />
                <div className="input-suffix">{selectedAsset}</div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={handleBorrow}
                disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || healthFactor < 1.2}
              >
                Borrow {selectedAsset}
              </button>
            </div>

            {healthFactor < 1.2 && (
              <div className="warning-message">
                ⚠️ Health factor too low. Add more collateral to borrow.
              </div>
            )}
          </div>
        )}

        {!userData && (
          <div className="connect-prompt">
            <p>Connect your wallet to start borrowing</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .asset-card.selected {
          border-color: #FF6B35;
          background: rgba(255, 107, 53, 0.05);
        }

        .borrow-form {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .collateral-info {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .collateral-info h4 {
          font-size: 14px;
          color: #888;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .collateral-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #fff;
        }

        .warning-message {
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #EF4444;
          font-size: 14px;
        }

        .connect-prompt {
          margin-top: 32px;
          padding: 24px;
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 12px;
          text-align: center;
          color: #FF6B35;
        }
      `}</style>
    </div>
  );
};

export default BorrowingInterface;