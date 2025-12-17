#!/bin/bash
# Stacks Wallet Generator for sbtc-lending deployment
# Generates testnet wallet addresses using Stacks CLI

set -e

echo "=========================================="
echo "Stacks Wallet Generator for Deployment"
echo "=========================================="
echo ""

# Check if Stacks CLI is installed
if ! command -v stx &> /dev/null; then
    echo "❌ Stacks CLI not found!"
    echo ""
    echo "📦 Installing Stacks CLI..."
    echo ""

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install Node.js first:"
        echo ""
        echo "  macOS:   brew install node"
        echo "  Linux:   sudo apt install nodejs npm"
        echo "  Windows: Download from https://nodejs.org/"
        echo ""
        exit 1
    fi

    echo "Installing @stacks/cli globally..."
    npm install -g @stacks/cli
    echo ""
fi

echo "✅ Stacks CLI found: $(stx --version)"
echo ""

# Create wallets directory
WALLET_DIR="./wallets"
mkdir -p "$WALLET_DIR"

echo "📁 Creating wallet directory: $WALLET_DIR"
echo ""

# Wallet names
WALLETS=("deployer" "wallet_1" "wallet_2" "wallet_3")

echo "🔑 Generating testnet wallets..."
echo ""

# Generate wallets
for wallet in "${WALLETS[@]}"; do
    echo "Generating $wallet..."
    stx make_keychain -t > "$WALLET_DIR/${wallet}-testnet.json"

    # Extract address for display
    address=$(cat "$WALLET_DIR/${wallet}-testnet.json" | grep -o '"address":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ $wallet: $address"
    echo ""
done

echo "=========================================="
echo "✅ Generated ${#WALLETS[@]} testnet wallets"
echo "=========================================="
echo ""

echo "📄 Wallet files created in: $WALLET_DIR/"
for wallet in "${WALLETS[@]}"; do
    echo "  - ${wallet}-testnet.json"
done
echo ""

echo "⚠️  SECURITY WARNING:"
echo "  - Keep your private keys and mnemonics SECURE"
echo "  - NEVER commit wallet JSON files to git"
echo "  - Add wallets/ directory to .gitignore"
echo "  - Use these for TESTNET ONLY"
echo ""

# Update .gitignore
if [ -f ".gitignore" ]; then
    if ! grep -q "wallets/" .gitignore; then
        echo "wallets/" >> .gitignore
        echo "*.json" >> .gitignore
        echo "✅ Updated .gitignore"
    fi
fi

echo "=========================================="
echo "🚀 Next Steps:"
echo "=========================================="
echo ""
echo "1. Fund your deployer wallet:"
echo "   - Address: $(cat "$WALLET_DIR/deployer-testnet.json" | grep -o '"address":"[^"]*"' | cut -d'"' -f4)"
echo "   - Faucet: https://explorer.hiro.so/sandbox/faucet"
echo ""
echo "2. View wallet details:"
echo "   cat $WALLET_DIR/deployer-testnet.json"
echo ""
echo "3. Check balance:"
echo "   stx balance \$(cat $WALLET_DIR/deployer-testnet.json | grep -o '\"address\":\"[^\"]*\"' | cut -d'\"' -f4) -t"
echo ""
echo "4. Deploy contract:"
echo "   See DEPLOYMENT.md for deployment instructions"
echo ""
echo "=========================================="
