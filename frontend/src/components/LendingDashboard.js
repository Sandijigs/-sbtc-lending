import React, { useState } from 'react';

const LendingDashboard = ({ marketData, onSupply, userData }) => {
  const [selectedAsset, setSelectedAsset] = useState('sBTC');
  const [supplyAmount, setSupplyAmount] = useState('');

  const handleSupply = () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onSupply(selectedAsset, parseFloat(supplyAmount));
    setSupplyAmount('');
  };

  const assets = [
    {
      symbol: 'sBTC',
      name: 'Synthetic Bitcoin',
      icon: '₿',
      color: '#F7931A',
      totalSupplied: marketData.totalSupplied?.sBTC || 0,
      supplyAPY: marketData.supplyAPYs?.sBTC || 0,
      utilization: marketData.utilizationRates?.sBTC || 0
    },
    {
      symbol: 'STX',
      name: 'Stacks',
      icon: 'Ӿ',
      color: '#5546FF',
      totalSupplied: marketData.totalSupplied?.STX || 0,
      supplyAPY: marketData.supplyAPYs?.STX || 0,
      utilization: marketData.utilizationRates?.STX || 0
    },
    {
      symbol: 'xUSD',
      name: 'Synthetic USD',
      icon: '$',
      color: '#22C55E',
      totalSupplied: marketData.totalSupplied?.xUSD || 0,
      supplyAPY: marketData.supplyAPYs?.xUSD || 0,
      utilization: marketData.utilizationRates?.xUSD || 0
    }
  ];

  return (
    <div className="lending-dashboard">
      <div className="market-card">
        <h3>Supply Assets</h3>
        <p style={{ color: '#888', marginBottom: '24px' }}>
          Earn interest by supplying assets to the lending pool
        </p>

        <div className="asset-grid">
          {assets.map((asset) => (
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
                <div className="apy-badge">
                  {asset.supplyAPY}% APY
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Supplied</div>
                  <div className="stat-value">
                    {asset.totalSupplied.toLocaleString()} {asset.symbol}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Utilization</div>
                  <div className="stat-value">
                    {(asset.utilization * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="utilization-bar">
                <div
                  className="utilization-fill"
                  style={{
                    width: `${asset.utilization * 100}%`,
                    background: asset.utilization > 0.8 ? '#EF4444' :
                              asset.utilization > 0.6 ? '#F59E0B' : '#22C55E'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {userData && (
          <div className="supply-form">
            <div className="input-group">
              <label className="input-label">
                Supply Amount ({selectedAsset})
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  className="input-field"
                  placeholder="0.00"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(e.target.value)}
                />
                <div className="input-suffix">{selectedAsset}</div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={handleSupply}
                disabled={!supplyAmount || parseFloat(supplyAmount) <= 0}
              >
                Supply {selectedAsset}
              </button>
            </div>
          </div>
        )}

        {!userData && (
          <div className="connect-prompt">
            <p>Connect your wallet to start supplying assets</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .asset-card {
          cursor: pointer;
          position: relative;
        }

        .asset-card.selected {
          border-color: #FF6B35;
          background: rgba(255, 107, 53, 0.05);
        }

        .utilization-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin-top: 12px;
          overflow: hidden;
        }

        .utilization-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .supply-form {
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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

export default LendingDashboard;