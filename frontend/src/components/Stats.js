import React from 'react';

const Stats = ({ marketData, metrics, contractAddress }) => {
  // Calculate total values
  const calculateTotalSupplied = () => {
    const { totalSupplied = {} } = marketData;
    // Mock USD values for calculation
    const values = {
      sBTC: (totalSupplied.sBTC || 0) * 30000,
      STX: (totalSupplied.STX || 0) * 0.5,
      xUSD: totalSupplied.xUSD || 0
    };
    return Object.values(values).reduce((sum, val) => sum + val, 0);
  };

  const calculateTotalBorrowed = () => {
    const { totalBorrowed = {} } = marketData;
    const values = {
      sBTC: (totalBorrowed.sBTC || 0) * 30000,
      STX: (totalBorrowed.STX || 0) * 0.5,
      xUSD: totalBorrowed.xUSD || 0
    };
    return Object.values(values).reduce((sum, val) => sum + val, 0);
  };

  const totalSuppliedUSD = calculateTotalSupplied();
  const totalBorrowedUSD = calculateTotalBorrowed();
  const tvl = totalSuppliedUSD;

  return (
    <div className="stats-dashboard">
      <div className="market-card">
        <h3>Protocol Statistics</h3>

        {/* Main Metrics */}
        <div className="main-metrics">
          <div className="metric-card primary">
            <div className="metric-label">Total Value Locked (TVL)</div>
            <div className="metric-value">
              ${tvl.toLocaleString()}
            </div>
            <div className="metric-change positive">
              +12.5% (24h)
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Supplied</div>
            <div className="metric-value">
              ${totalSuppliedUSD.toLocaleString()}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Borrowed</div>
            <div className="metric-value">
              ${totalBorrowedUSD.toLocaleString()}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Protocol Utilization</div>
            <div className="metric-value">
              {totalSuppliedUSD > 0
                ? ((totalBorrowedUSD / totalSuppliedUSD) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>

        {/* Market Details */}
        <div className="market-details">
          <h4>Market Details</h4>
          <div className="market-table">
            <div className="table-header">
              <div>Asset</div>
              <div>Total Supplied</div>
              <div>Total Borrowed</div>
              <div>Supply APY</div>
              <div>Borrow APY</div>
              <div>Utilization</div>
            </div>

            {['sBTC', 'STX', 'xUSD'].map((asset) => (
              <div key={asset} className="table-row">
                <div className="asset-cell">
                  <span className="asset-symbol">{asset}</span>
                </div>
                <div>{(marketData.totalSupplied?.[asset] || 0).toLocaleString()}</div>
                <div>{(marketData.totalBorrowed?.[asset] || 0).toLocaleString()}</div>
                <div className="apy-positive">
                  {marketData.supplyAPYs?.[asset] || 0}%
                </div>
                <div className="apy-negative">
                  {marketData.borrowAPYs?.[asset] || 0}%
                </div>
                <div>
                  <div className="utilization-bar-small">
                    <div
                      className="utilization-fill"
                      style={{
                        width: `${(marketData.utilizationRates?.[asset] || 0) * 100}%`,
                        background: (marketData.utilizationRates?.[asset] || 0) > 0.8
                          ? '#EF4444'
                          : (marketData.utilizationRates?.[asset] || 0) > 0.6
                          ? '#F59E0B'
                          : '#22C55E'
                      }}
                    />
                  </div>
                  <span className="utilization-text">
                    {((marketData.utilizationRates?.[asset] || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Week 3 Metrics */}
        <div className="week3-metrics">
          <h4>Week 3 Challenge Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-icon">👛</div>
              <div className="metric-info">
                <div className="metric-title">Total Connections</div>
                <div className="metric-count">{metrics.totalConnections || 0}</div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <div className="metric-title">Unique Users</div>
                <div className="metric-count">{metrics.uniqueWallets || 0}</div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <div className="metric-title">Total Transactions</div>
                <div className="metric-count">{metrics.totalTransactions || 0}</div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">💰</div>
              <div className="metric-info">
                <div className="metric-title">Fees Generated</div>
                <div className="metric-count">
                  {(metrics.totalFeesGenerated || 0).toFixed(4)} STX
                </div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">🔗</div>
              <div className="metric-info">
                <div className="metric-title">WalletKit Connections</div>
                <div className="metric-count">
                  {metrics.connectionMethods?.walletkit || 0}
                </div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">🚀</div>
              <div className="metric-info">
                <div className="metric-title">Reown AppKit Connections</div>
                <div className="metric-count">
                  {metrics.connectionMethods?.reown || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="contract-info">
          <h4>Contract Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Contract Address:</span>
              <span className="info-value monospace">{contractAddress}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Network:</span>
              <span className="info-value">Stacks Testnet</span>
            </div>
            <div className="info-item">
              <span className="info-label">WalletConnect Project ID:</span>
              <span className="info-value monospace">973aec75d9c96397c8ccd94d62bada81</span>
            </div>
            <div className="info-item">
              <span className="info-label">Protocol Version:</span>
              <span className="info-value">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .metric-card.primary {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
          border-color: rgba(255, 107, 53, 0.3);
        }

        .metric-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 107, 53, 0.3);
        }

        .metric-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .metric-change {
          font-size: 14px;
          font-weight: 500;
        }

        .metric-change.positive {
          color: #22C55E;
        }

        .metric-change.negative {
          color: #EF4444;
        }

        .market-details {
          margin-bottom: 40px;
        }

        .market-details h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FF6B35;
        }

        .market-table {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 0.8fr 0.8fr 1.2fr;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 0.8fr 0.8fr 1.2fr;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .asset-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .asset-symbol {
          font-weight: 600;
          color: #FF6B35;
        }

        .apy-positive {
          color: #22C55E;
          font-weight: 500;
        }

        .apy-negative {
          color: #EF4444;
          font-weight: 500;
        }

        .utilization-bar-small {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin-bottom: 4px;
          overflow: hidden;
        }

        .utilization-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .utilization-text {
          font-size: 12px;
          color: #888;
        }

        .week3-metrics {
          margin-bottom: 40px;
        }

        .week3-metrics h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FF6B35;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
        }

        .metric-icon {
          font-size: 32px;
        }

        .metric-info {
          flex: 1;
        }

        .metric-title {
          font-size: 12px;
          color: #888;
          margin-bottom: 4px;
        }

        .metric-count {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }

        .contract-info h4 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FF6B35;
        }

        .info-grid {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 14px;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #888;
        }

        .info-value {
          color: #fff;
          font-weight: 500;
        }

        .monospace {
          font-family: monospace;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .main-metrics {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .table-header > div,
          .table-row > div {
            display: flex;
            justify-content: space-between;
          }

          .table-header > div::before,
          .table-row > div::before {
            content: attr(data-label);
            font-weight: 600;
          }
        }
      `}</style>
    </div>
  );
};

export default Stats;