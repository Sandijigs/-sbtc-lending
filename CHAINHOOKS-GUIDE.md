# 🔗 Hiro Chainhooks Integration Guide

## Overview

This project integrates **Hiro Chainhooks** to monitor and react to events from the sbtc-lending smart contract in real-time.

**Chainhooks Package**: https://www.npmjs.com/package/@hirosystems/chainhooks-client

---

## 🎯 Builder Challenge Integration

This integration contributes to the **Stacks Builder Challenge** leaderboard through:

### ✅ Use of Hiro Chainhooks
- Real-time event monitoring
- Automated event processing
- Custom event handlers for all 6 contract events

### ✅ Smart Contract Activity
- **Users**: Multi-user lending protocol tracking borrowers and liquidators
- **Fees**: Protocol fees tracked and monitored via events
- **Transactions**: All contract interactions logged and monitored

### ✅ GitHub Contributions
- Public repository with comprehensive documentation
- Open-source chainhooks integration
- Reusable scripts and automation

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Or install chainhooks specifically
npm install @hirosystems/chainhooks-client
```

---

## 🔧 Configuration

### 1. Environment Variables

Create a `.env` file:

```bash
# Chainhooks Configuration
WEBHOOK_URL=http://localhost:3000/webhook
WEBHOOK_AUTH=Bearer YOUR_SECRET_TOKEN
CHAINHOOKS_URL=https://api.hiro.so

# Contract Execution
PRIVATE_KEY=your_private_key_here
NETWORK=testnet
```

### 2. Chainhook Definition

The chainhook is configured to monitor:
- **Contract**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-lending`
- **Network**: testnet
- **Scope**: All contract calls
- **Events**: All print events

---

## 🎧 Event Monitoring

### Start the Listener

```bash
npm run start:chainhooks
```

### Monitored Events

| Event | Description | Tracked Data |
|-------|-------------|--------------|
| `collateral-approved` | New collateral token approved | token-contract, token-name, ltv-ratio |
| `loan-created` | New loan opened | loan-id, borrower, amounts, interest-rate |
| `loan-repaid` | Loan payment made | loan-id, amounts, fully-repaid status |
| `collateral-added` | Collateral increased | loan-id, amount, new-total |
| `loan-liquidated` | Position liquidated | loan-id, borrower, liquidator, amounts |
| `price-updated` | Oracle price changed | old-price, new-price |

### Example Output

```
🔗 Hiro Chainhooks Listener - sbtc-lending
======================================================================

Contract: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-lending
Network:  testnet

Monitoring events:
  ✓ collateral-approved
  ✓ loan-created
  ✓ loan-repaid
  ✓ collateral-added
  ✓ loan-liquidated
  ✓ price-updated

======================================================================

💰 Loan Created: {
  loanId: 1,
  borrower: 'ST2...',
  collateralAmount: 1000000000,
  borrowedAmount: 500000000,
  interestRate: 500,
  timestamp: 1702825200
}
```

---

## 🤖 Automated Scripts

### 1. Get Protocol Statistics

```bash
npm run execute:stats
```

Fetches and displays:
- Total collateral locked
- Total borrowed
- Protocol fees collected
- Current sBTC price
- Block time

### 2. Execute Borrow

```bash
npm run execute:borrow 1000000000 500000000
```

Arguments:
- Collateral amount (microSTX)
- Borrow amount (microSTX)

### 3. Execute Repay

```bash
npm run execute:repay <loan-id> <amount>
```

### 4. Execute Liquidation

```bash
npm run execute:liquidate <loan-id>
```

---

## 📊 Event Handler Customization

### Adding Custom Logic

Edit `src/chainhooks/listener.js`:

```javascript
const eventHandlers = {
  'loan-created': (event) => {
    // Your custom logic
    console.log('New loan created!', event);

    // Example: Send notification
    sendNotification({
      type: 'loan-created',
      loanId: event['loan-id'],
      borrower: event.borrower,
    });

    // Example: Update database
    database.loans.insert({
      id: event['loan-id'],
      borrower: event.borrower,
      amount: event['borrowed-amount'],
      timestamp: event.timestamp,
    });

    // Example: Trigger automated action
    if (event['borrowed-amount'] > 1000000000) {
      triggerLargeL oanAlert(event);
    }
  },
};
```

---

## 🔔 Webhook Integration

### Setup Webhook Endpoint

```javascript
const express = require('express');
const app = express();

app.post('/webhook', express.json(), (req, res) => {
  const event = req.body;

  // Process chainhook event
  console.log('Received chainhook:', event);

  // Your custom processing
  processEvent(event);

  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

---

## 📈 Metrics Tracked for Builder Challenge

### Chainhooks Usage
- ✅ Real-time event monitoring
- ✅ Custom event handlers
- ✅ Automated reactions to contract events

### User Activity
- Total unique borrowers
- Active loans count
- Liquidation events
- Collateral additions

### Fee Generation
- Interest collected
- Liquidation bonuses
- Total protocol fees

### GitHub Activity
- Public repository
- Comprehensive documentation
- Code examples and scripts

---

## 🧪 Testing

### Test Event Listener

```bash
npm run test:chainhooks
```

### Trigger Test Events

1. **Create a loan**:
   ```bash
   npm run execute:borrow 1000000000 500000000
   ```

2. **Watch the chainhook listener** pick up the event:
   ```
   💰 Loan Created: { loan-id: 1, ... }
   ```

3. **Verify on Explorer**:
   Check transaction on https://explorer.hiro.so/

---

## 🎯 Integration Benefits

### Real-time Monitoring
- Instant notification of all contract events
- No polling required
- Scalable event processing

### Automated Actions
- Auto-liquidation monitoring
- Price update triggers
- User notifications

### Analytics
- Track protocol metrics
- User behavior analysis
- Fee collection monitoring

### Builder Challenge Score
- ✅ Chainhooks integration (major points)
- ✅ Active contract with users and fees
- ✅ Public GitHub contributions

---

## 📚 Additional Resources

- **Chainhooks Documentation**: https://docs.hiro.so/chainhooks
- **NPM Package**: https://www.npmjs.com/package/@hirosystems/chainhooks-client
- **Contract Explorer**: https://explorer.hiro.so/txid/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-lending?chain=testnet
- **Builder Challenge**: https://www.stacks.co/builder-challenge

---

## 🤝 Contributing

Contributions welcome! This integration is designed to be:
- **Reusable**: Easy to adapt for other contracts
- **Extensible**: Simple to add new event handlers
- **Well-documented**: Clear examples and instructions

---

**Last Updated**: 2024-12-17
**Contract**: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-lending
**Network**: Stacks Testnet
**Chainhooks Version**: ^1.8.1
