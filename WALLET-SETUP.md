# 🔑 Wallet Setup Guide - Quick Start

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Stacks CLI

```bash
# Install Node.js (if not already installed)
brew install node  # macOS
# or visit https://nodejs.org/

# Install Stacks CLI
npm install --global @stacks/cli

# Verify installation
stx --version
```

### Step 2: Generate Wallets

```bash
cd sbtc-lending

# Option A: Use the provided script (easiest)
./generate-wallets.sh

# Option B: Manual generation
stx make_keychain -t > wallets/deployer-testnet.json
```

### Step 3: Fund Your Wallet

1. Get your deployer address:
```bash
cat wallets/deployer-testnet.json | grep "address"
```

2. Visit testnet faucet:
   - **URL**: https://explorer.hiro.so/sandbox/faucet
   - Paste your address (starts with `ST`)
   - Request 500 STX

3. Verify balance:
```bash
# Extract address from wallet file
ADDR=$(cat wallets/deployer-testnet.json | grep -o '"address":"[^"]*"' | cut -d'"' -f4)

# Check balance
stx balance $ADDR -t
```

## 📋 Generated Wallet Structure

After running `./generate-wallets.sh`, you'll have:

```
wallets/
├── deployer-testnet.json   # Main deployment wallet
├── wallet_1-testnet.json   # Test wallet 1
├── wallet_2-testnet.json   # Test wallet 2
└── wallet_3-testnet.json   # Test wallet 3
```

Each wallet JSON contains:

```json
{
  "mnemonic": "word word word ... (24 words)",
  "keyInfo": {
    "privateKey": "abc123...",
    "address": "ST1ABC...",
    "btcAddress": "mBTC...",
    "wif": "cRRz...",
    "index": 0
  }
}
```

## 🎯 What You Need for Deployment

### Minimum Requirements:

1. **Deployer Address** (testnet)
   - Starts with `ST`
   - Example: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`

2. **Deployer Mnemonic** (24 words)
   - Keep this SECRET
   - Required for signing transactions

3. **Testnet STX Balance**
   - Minimum: 0.5 STX for deployment
   - Get from faucet: Free

## 🔐 Security Checklist

- [ ] Generated wallets using official Stacks CLI
- [ ] Saved wallet JSON files in secure location
- [ ] Added `wallets/` directory to .gitignore
- [ ] NEVER committed private keys to git
- [ ] Backed up mnemonic phrases securely
- [ ] Using TESTNET addresses only for testing

## ⚠️ Common Issues

### Issue 1: Stacks CLI not found

**Solution:**
```bash
npm install -g @stacks/cli
# If permission denied:
sudo npm install -g @stacks/cli
```

### Issue 2: Node.js not installed

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Windows:**
Download from https://nodejs.org/

### Issue 3: Cannot fund wallet from faucet

**Solutions:**
- Wait 24 hours between faucet requests
- Use alternative faucet: https://faucet.stacks.co/
- Ask in Discord: https://discord.gg/stacks

## 📚 Reference

### Stacks CLI Commands

```bash
# Generate new testnet wallet
stx make_keychain -t > wallet.json

# Generate mainnet wallet
stx make_keychain > wallet-mainnet.json

# Check testnet balance
stx balance ST1ABC... -t

# Check mainnet balance
stx balance SP1ABC...

# View wallet from file
cat wallets/deployer-testnet.json | jq
```

### Address Formats

| Network | Prefix | Example |
|---------|--------|---------|
| Testnet | `ST` | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` |
| Mainnet | `SP` | `SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7` |

## 🚀 Ready to Deploy?

Once your wallet is funded, proceed to deployment:

```bash
# See full deployment guide
cat DEPLOYMENT.md

# Or jump straight to deployment
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

## 💡 Pro Tips

1. **Use Environment Variables**
   ```bash
   export DEPLOYER_ADDR=$(cat wallets/deployer-testnet.json | grep -o '"address":"[^"]*"' | cut -d'"' -f4)
   echo $DEPLOYER_ADDR
   ```

2. **Quick Balance Check**
   ```bash
   alias check-balance='stx balance $DEPLOYER_ADDR -t'
   check-balance
   ```

3. **Backup Mnemonics**
   - Save in password manager
   - Write on paper (offline backup)
   - Store in multiple secure locations

## 📞 Need Help?

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Stacks Discord**: https://discord.gg/stacks
- **Hiro Support**: https://docs.hiro.so/
- **GitHub Issues**: Report issues in this repository

---

**Last Updated**: 2024-12-17
**For**: sbtc-lending contract deployment
**Network**: Stacks Testnet (Clarity 4, Epoch 3.3)
