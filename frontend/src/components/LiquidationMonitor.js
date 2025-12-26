import React from 'react';

const LiquidationMonitor = ({ marketData, userData }) => {
  // Mock liquidation opportunities data
  const liquidationOpportunities = [
    {
      id: 1,
      borrower: 'ST1PQHQ...PGZGM',
      collateral: { asset: 'sBTC', amount: 0.5, value: 15000 },
      borrowed: { asset: 'xUSD', amount: 12000, value: 12000 },
      healthFactor: 0.94,
      liquidationBonus: 5,
      potentialProfit: 600
    },
    {
      id: 2,
      borrower: 'ST2JHG3...05NNC',
      collateral: { asset: 'STX', amount: 10000, value: 5000 },
      borrowed: { asset: 'xUSD', amount: 4200, value: 4200 },
      healthFactor: 0.89,
      liquidationBonus: 7,
      potentialProfit: 294
    },
    {
      id: 3,
      borrower: 'ST3NBRS...21XCP',
      collateral: { asset: 'sBTC', amount: 1.2, value: 36000 },
      borrowed: { asset: 'xUSD', amount: 30000, value: 30000 },
      healthFactor: 0.96,
      liquidationBonus: 5,
      potentialProfit: 1500
    }
  ];

  return (
    <div className="liquidation-monitor">
      <div className="market-card">
        <h3>Liquidation Monitor</h3>
        <p style={{ color: '#888', marginBottom: '24px' }}>
          Monitor and execute liquidations to earn bonuses
        </p>

        {/* Liquidation Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active Opportunities</div>
            <div className="stat-value">{liquidationOpportunities.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Value at Risk</div>
            <div className="stat-value">
              ${liquidationOpportunities.reduce((sum, opp) => sum + opp.borrowed.value, 0).toLocaleString()}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg. Liquidation Bonus</div>
            <div className="stat-value">
              {(liquidationOpportunities.reduce((sum, opp) => sum + opp.liquidationBonus, 0) / liquidationOpportunities.length).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Liquidation Opportunities */}
        <div className="opportunities-list">
          <h4>Liquidation Opportunities</h4>

          {liquidationOpportunities.map((opp) => (
            <div key={opp.id} className="opportunity-card">
              <div className="opportunity-header">
                <div className="borrower-info">
                  <span className="label">Borrower:</span>
                  <span className="address">{opp.borrower}</span>
                </div>
                <div
                  className="health-badge"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444'
                  }}
                >
                  Health: {opp.healthFactor.toFixed(2)}
                </div>
              </div>

              <div className="position-details">
                <div className="position-row">
                  <div className="position-item">
                    <span className="label">Collateral:</span>
                    <span className="value">
                      {opp.collateral.amount} {opp.collateral.asset}
                      <span className="usd-value"> (${opp.collateral.value.toLocaleString()})</span>
                    </span>
                  </div>
                  <div className="position-item">
                    <span className="label">Borrowed:</span>
                    <span className="value">
                      {opp.borrowed.amount.toLocaleString()} {opp.borrowed.asset}
                      <span className="usd-value"> (${opp.borrowed.value.toLocaleString()})</span>
                    </span>
                  </div>
                </div>

                <div className="profit-info">
                  <div className="profit-item">
                    <span className="label">Liquidation Bonus:</span>
                    <span className="value">{opp.liquidationBonus}%</span>
                  </div>
                  <div className="profit-item">
                    <span className="label">Potential Profit:</span>
                    <span className="value" style={{ color: '#22C55E' }}>
                      +${opp.potentialProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {userData && (
                <button className="btn-primary liquidate-btn">
                  Liquidate Position
                </button>
              )}
            </div>
          ))}
        </div>

        {!userData && (
          <div className="connect-prompt">
            <p>Connect your wallet to participate in liquidations</p>
          </div>
        )}

        {/* Educational Section */}
        <div className="education-section">
          <h4>How Liquidations Work</h4>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-number">1</div>
              <div className="info-content">
                <h5>Health Factor Drops</h5>
                <p>When a borrower's health factor falls below 1.0, their position becomes eligible for liquidation</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-number">2</div>
              <div className="info-content">
                <h5>Liquidator Steps In</h5>
                <p>Any user can repay part of the borrower's debt in exchange for their collateral</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-number">3</div>
              <div className="info-content">
                <h5>Earn Bonus</h5>
                <p>Liquidators receive a bonus (typically 5-10%) for maintaining protocol solvency</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
        }

        .stat-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
        }

        .opportunities-list h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FF6B35;
        }

        .opportunity-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .opportunity-card:hover {
          border-color: rgba(255, 107, 53, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .opportunity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .borrower-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .borrower-info .label {
          color: #888;
          font-size: 14px;
        }

        .borrower-info .address {
          font-family: monospace;
          color: #FF6B35;
          font-size: 14px;
        }

        .health-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .position-details {
          margin: 16px 0;
        }

        .position-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .position-item {
          font-size: 14px;
        }

        .position-item .label {
          color: #888;
          margin-right: 8px;
        }

        .position-item .value {
          color: #fff;
        }

        .usd-value {
          color: #888;
          font-size: 12px;
        }

        .profit-info {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profit-item {
          font-size: 14px;
        }

        .profit-item .label {
          color: #888;
          margin-right: 8px;
        }

        .profit-item .value {
          color: #fff;
          font-weight: 600;
        }

        .liquidate-btn {
          width: 100%;
          margin-top: 16px;
        }

        .education-section {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .education-section h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FF6B35;
        }

        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .info-card {
          display: flex;
          gap: 16px;
        }

        .info-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .info-content h5 {
          font-size: 14px;
          margin-bottom: 8px;
          color: #fff;
        }

        .info-content p {
          font-size: 12px;
          color: #888;
          line-height: 1.6;
        }

        .connect-prompt {
          padding: 24px;
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 12px;
          text-align: center;
          color: #FF6B35;
          margin: 24px 0;
        }
      `}</style>
    </div>
  );
};

export default LiquidationMonitor;