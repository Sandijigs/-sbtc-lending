import React, { useState } from 'react';

const PositionManager = ({ positions, marketData, onRepay, userData }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');

  const handleRepay = (asset) => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onRepay(asset, parseFloat(repayAmount));
    setRepayAmount('');
    setSelectedPosition(null);
  };

  const calculateTotalValue = (type) => {
    return positions
      .filter(p => p.type === type)
      .reduce((sum, p) => sum + p.value, 0);
  };

  const totalSupplied = calculateTotalValue('collateral');
  const totalBorrowed = calculateTotalValue('borrowed');
  const netValue = totalSupplied - totalBorrowed;

  if (!userData) {
    return (
      <div className="position-manager">
        <div className="market-card">
          <h3>My Positions</h3>
          <div className="connect-prompt">
            <p>Connect your wallet to view your positions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="position-manager">
      <div className="market-card">
        <h3>My Positions</h3>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Supplied</div>
            <div className="summary-value" style={{ color: '#22C55E' }}>
              ${totalSupplied.toLocaleString()}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Borrowed</div>
            <div className="summary-value" style={{ color: '#EF4444' }}>
              ${totalBorrowed.toLocaleString()}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Net Value</div>
            <div className="summary-value" style={{ color: '#FF6B35' }}>
              ${netValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Positions List */}
        <div className="positions-list">
          <h4>Active Positions</h4>

          {positions.length === 0 ? (
            <div className="empty-state">
              <p>No active positions yet</p>
              <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
                Start by supplying collateral or borrowing assets
              </p>
            </div>
          ) : (
            <>
              {/* Supplied Assets */}
              <div className="position-section">
                <h5>Supplied (Collateral)</h5>
                {positions
                  .filter(p => p.type === 'collateral')
                  .map((position, index) => (
                    <div key={index} className="position-card">
                      <div className="position-header">
                        <div className="position-info">
                          <span className="position-asset">{position.asset}</span>
                          <span className="position-type collateral">
                            Collateral
                          </span>
                        </div>
                        <div className="position-apy">
                          +{position.apy}% APY
                        </div>
                      </div>

                      <div className="position-details">
                        <div className="detail-item">
                          <span>Amount</span>
                          <span>{position.amount} {position.asset}</span>
                        </div>
                        <div className="detail-item">
                          <span>Value</span>
                          <span>${position.value.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span>Daily Earnings</span>
                          <span>+${(position.value * position.apy / 36500).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button className="btn-secondary">Withdraw</button>
                        <button className="btn-secondary">Add More</button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Borrowed Assets */}
              <div className="position-section">
                <h5>Borrowed</h5>
                {positions
                  .filter(p => p.type === 'borrowed')
                  .map((position, index) => (
                    <div key={index} className="position-card">
                      <div className="position-header">
                        <div className="position-info">
                          <span className="position-asset">{position.asset}</span>
                          <span className="position-type borrowed">
                            Borrowed
                          </span>
                        </div>
                        <div className="position-apy" style={{ color: '#EF4444' }}>
                          -{position.apy}% APY
                        </div>
                      </div>

                      <div className="position-details">
                        <div className="detail-item">
                          <span>Amount</span>
                          <span>{position.amount} {position.asset}</span>
                        </div>
                        <div className="detail-item">
                          <span>Value</span>
                          <span>${position.value.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span>Daily Interest</span>
                          <span style={{ color: '#EF4444' }}>
                            -${(position.value * position.apy / 36500).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button
                          className="btn-primary"
                          onClick={() => setSelectedPosition(position)}
                        >
                          Repay
                        </button>
                        <button className="btn-secondary">Borrow More</button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Repay Modal */}
        {selectedPosition && (
          <div className="repay-modal">
            <h4>Repay {selectedPosition.asset}</h4>
            <div className="input-group">
              <label className="input-label">
                Repay Amount (Max: {selectedPosition.amount} {selectedPosition.asset})
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  className="input-field"
                  placeholder="0.00"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  max={selectedPosition.amount}
                />
                <div className="input-suffix">{selectedPosition.asset}</div>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={() => handleRepay(selectedPosition.asset)}
              >
                Confirm Repay
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedPosition(null);
                  setRepayAmount('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
        }

        .summary-label {
          font-size: 14px;
          color: #888;
          margin-bottom: 8px;
        }

        .summary-value {
          font-size: 28px;
          font-weight: 600;
        }

        .positions-list h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FF6B35;
        }

        .position-section {
          margin-bottom: 32px;
        }

        .position-section h5 {
          font-size: 14px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .position-details {
          margin: 16px 0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #ccc;
        }

        .position-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .position-asset {
          font-size: 18px;
          font-weight: 600;
        }

        .position-apy {
          font-size: 16px;
          font-weight: 500;
          color: #22C55E;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: #888;
        }

        .repay-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1f 100%);
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 16px;
          padding: 32px;
          z-index: 1000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          min-width: 400px;
        }

        .repay-modal h4 {
          font-size: 20px;
          margin-bottom: 24px;
          color: #FF6B35;
        }

        .connect-prompt {
          padding: 40px;
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

export default PositionManager;