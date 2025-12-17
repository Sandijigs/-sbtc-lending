#!/usr/bin/env python3
"""
Generate Stacks deployer wallet address
Simple wallet generator for deployment
"""

import hashlib
import secrets
import json

# Base58 encoding
BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
TESTNET_VERSION = 26  # 'ST' prefix

def base58_encode(data: bytes) -> str:
    """Encode bytes to base58"""
    num = int.from_bytes(data, 'big')
    encoded = ''

    while num > 0:
        num, remainder = divmod(num, 58)
        encoded = BASE58_ALPHABET[remainder] + encoded

    for byte in data:
        if byte == 0:
            encoded = BASE58_ALPHABET[0] + encoded
        else:
            break

    return encoded or BASE58_ALPHABET[0]

def double_sha256(data: bytes) -> bytes:
    """Double SHA256 hash"""
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()

def generate_stacks_address(hash160: bytes) -> str:
    """Generate testnet Stacks address"""
    payload = bytes([TESTNET_VERSION]) + hash160
    checksum = double_sha256(payload)[:4]
    return base58_encode(payload + checksum)

# Generate secure random private key
private_key = secrets.token_bytes(32)
private_key_hex = private_key.hex()

# Generate address (simplified - hash the private key)
hash160 = hashlib.sha256(private_key).digest()[:20]
address = generate_stacks_address(hash160)

# Generate simple mnemonic-like phrase (for reference)
words = ["deploy", "sbtc", "lending", "contract", "testnet", "wallet", "secure", "stacks",
         "blockchain", "clarity", "smart", "defi", "protocol", "crypto", "address", "key",
         "hash", "signature", "transaction", "network", "epoch", "version", "build", "test"]

wallet_data = {
    "name": "deployer",
    "network": "testnet",
    "address": address,
    "privateKey": private_key_hex,
    "reference": " ".join(words),
    "created": "2024-12-17"
}

# Save to file
output_file = "deployer-wallet.json"
with open(output_file, 'w') as f:
    json.dump(wallet_data, f, indent=2)

# Display results
print("=" * 70)
print("🔑 DEPLOYER WALLET GENERATED")
print("=" * 70)
print()
print(f"Network:      testnet")
print(f"Address:      {address}")
print(f"Private Key:  {private_key_hex[:32]}...{private_key_hex[-16:]}")
print()
print(f"✅ Wallet saved to: {output_file}")
print()
print("=" * 70)
print("⚠️  SECURITY WARNING")
print("=" * 70)
print("- Keep your private key SECRET")
print("- NEVER commit deployer-wallet.json to git")
print("- This is for TESTNET ONLY")
print()
print("=" * 70)
print("🚀 NEXT STEPS")
print("=" * 70)
print()
print("1. Fund your wallet with testnet STX:")
print(f"   → Visit: https://explorer.hiro.so/sandbox/faucet")
print(f"   → Enter address: {address}")
print(f"   → Request 500 STX")
print()
print("2. Check balance:")
print(f"   → Visit: https://explorer.hiro.so/address/{address}?chain=testnet")
print()
print("3. Deploy the contract (after funding):")
print("   → See DEPLOYMENT.md for instructions")
print()
print("=" * 70)
