# 🚀 Stacks Wallet Generation & Deployment Guide

## 📋 Overview

This guide covers generating Stacks wallet addresses for deploying the sbtc-lending smart contract using official Stacks CLI and best practices.

## 🔧 Prerequisites

Install the official Stacks CLI:

```bash
# Install Node.js if not already installed (required for Stacks CLI)
brew install node  # macOS
# or
sudo apt install nodejs npm  # Linux

# Install Stacks CLI globally
npm install --global @stacks/cli
```

## 🔑 Method 1: Using Stacks CLI (Recommended)

### Generate Testnet Wallet

```bash
# Generate a new testnet wallet and save to file
stx make_keychain -t > deployer-testnet.json

# View the generated wallet
cat deployer-testnet.json
```

**Output format:**
```json
{
  "mnemonic": "your 24 word seed phrase here...",
  "keyInfo": {
    "privateKey": "your_private_key_hex",
    "address": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "btcAddress": "mgSadu5jjPbjSYjXsZcfSKSdVEqeHaP8RN",
    "wif": "cRRz...",
    "index": 0
  }
}
```

### Generate Mainnet Wallet

```bash
# Generate mainnet wallet (omit -t flag)
stx make_keychain > deployer-mainnet.json

# View the wallet
cat deployer-mainnet.json
```

### Generate Multiple Wallets for Testing

```bash
# Generate deployer wallet
stx make_keychain -t > deployer.json

# Generate wallet_1
stx make_keychain -t > wallet_1.json

# Generate wallet_2
stx make_keychain -t > wallet_2.json

# Generate wallet_3
stx make_keychain -t > wallet_3.json
```

## 🔑 Method 2: Using Clarinet (Alternative)

Clarinet has built-in test wallets configured in `settings/Simnet.toml` and `settings/Devnet.toml`. These are useful for local development and testing.

### View Existing Test Wallets

```bash
cd sbtc-lending
cat settings/Simnet.toml
```

## 📝 Update Deployment Configuration

### Update Devnet.toml

After generating your wallets, update the configuration:

```bash
cd sbtc-lending/settings
nano Devnet.toml
```

Update with your generated mnemonics:

```toml
[network]
name = "devnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "YOUR_GENERATED_MNEMONIC_HERE"
balance = 10_000_000_000_000

[accounts.wallet_1]
mnemonic = "YOUR_WALLET_1_MNEMONIC_HERE"
balance = 10_000_000_000_000

[devnet]
disable_stacks_explorer = false
disable_stacks_api = false
stacks_node_wait_time_for_microblocks = 50
```

## 💰 Fund Your Testnet Wallet

### Get Testnet STX Tokens

1. **Hiro Testnet Faucet**
   - Visit: https://explorer.hiro.so/sandbox/faucet
   - Enter your testnet address (starts with `ST`)
   - Request 500 STX tokens

2. **Alternative Faucet**
   - Visit: https://faucet.stacks.co/
   - Enter your address
   - Complete CAPTCHA

### Verify Balance

```bash
# Check balance using Stacks CLI
stx balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM -t

# Or check on explorer
# Visit: https://explorer.hiro.so/address/YOUR_ADDRESS?chain=testnet
```

## 🚀 Deploy to Testnet

### Option 1: Using Clarinet

```bash
cd sbtc-lending

# Create deployment plan
clarinet deployments generate --testnet

# Review deployment plan
cat deployments/default.testnet-plan.yaml

# Apply deployment
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Option 2: Using Stacks CLI

```bash
# Deploy contract
stx deploy_contract \
  ./contracts/sbtc-lending.clar \
  sbtc-lending \
  -t \
  --private-key YOUR_PRIVATE_KEY
```

## 🔐 Security Best Practices

### 1. **Never Commit Private Keys or Mnemonics**

Add to `.gitignore`:
```bash
# Add to .gitignore
echo "*.json" >> .gitignore
echo "deployer*.json" >> .gitignore
echo "wallet*.json" >> .gitignore
echo ".env" >> .gitignore
echo ".secrets/" >> .gitignore
```

### 2. **Use Environment Variables**

Create `.env` file (never commit this):
```bash
# .env
DEPLOYER_MNEMONIC="your 24 word mnemonic here"
DEPLOYER_PRIVATE_KEY="your_private_key_hex"
TESTNET_WALLET_ADDRESS="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
```

### 3. **Backup Your Mnemonics Securely**

- Store in a password manager (1Password, LastPass)
- Write on paper and store in a safe
- Use hardware wallets for mainnet
- Never share mnemonics via email or chat

### 4. **Separate Wallets for Different Networks**

- **Testnet**: Use for testing only
- **Mainnet**: Use different mnemonics for production
- **Development**: Use Clarinet's built-in test wallets

### 5. **Use Hardware Wallets for Mainnet**

For production deployments:
- Ledger Nano S/X
- Trezor
- Never store mainnet keys on internet-connected devices

## 📊 Wallet Address Formats

### Testnet Addresses
- Start with: `ST`
- Example: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`

### Mainnet Addresses
- Start with: `SP`
- Example: `SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7`

## 🧪 Testing Deployment

### Verify Contract Deployment

```bash
# Check if contract is deployed
stx get_contract_source \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-lending \
  -t

# View on explorer
# https://explorer.hiro.so/txid/YOUR_TX_ID?chain=testnet
```

### Test Contract Functions

```bash
# Using Clarinet console
clarinet console

# In console:
(contract-call? .sbtc-lending get-protocol-stats)
```

## 📚 Additional Resources

- **Stacks CLI Reference**: https://docs.hiro.so/
- **Stacks Documentation**: https://docs.stacks.co/
- **Testnet Explorer**: https://explorer.hiro.so/?chain=testnet
- **Mainnet Explorer**: https://explorer.hiro.so/
- **Hiro Platform**: https://platform.hiro.so/

## ⚠️ Important Notes

1. **Testnet vs Mainnet**
   - Always test on testnet first
   - Testnet tokens have no value
   - Mainnet deployment costs real STX

2. **Gas Fees**
   - Testnet: Free (from faucet)
   - Mainnet: Requires STX for deployment fees

3. **Contract Immutability**
   - Once deployed, contracts cannot be modified
   - Test thoroughly before mainnet deployment
   - Consider using upgradeable proxy patterns

## 🎯 Quick Reference Commands

```bash
# Install Stacks CLI
npm install -g @stacks/cli

# Generate testnet wallet
stx make_keychain -t > deployer.json

# Check balance
stx balance <address> -t

# Deploy contract
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Verify deployment
stx get_contract_source <address>.<contract-name> -t
```

---

**Last Updated**: 2024-12-17
**Compatible with**: Clarinet 4.x, Stacks CLI 7.x, Clarity 4 (Epoch 3.3)
