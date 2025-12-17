# 🏦 sBTC Collateralized Lending Protocol

A DeFi lending protocol where users can borrow against sBTC collateral with real-time interest accrual, built with **Clarity 4**.

## 🎯 Clarity 4 Features Used

| Feature | Usage |
|---------|-------|
| `stacks-block-time` | Real-time interest accrual and liquidation timing |
| `contract-hash?` | Verify approved collateral tokens |
| `to-ascii?` | Generate human-readable loan receipts |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 sBTC Lending Protocol                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Deposit Collateral → Borrow STX → Accrue Interest         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Collateral Verification                 │   │
│   │           (contract-hash? for tokens)               │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│   ┌───────────────────────┼───────────────────────┐         │
│   │                       │                       │         │
│   ▼                       ▼                       ▼         │
│ ┌─────────┐        ┌───────────┐          ┌───────────┐    │
│ │ Borrow  │        │  Interest │          │ Liquidate │    │
│ │ @ 150%  │        │  (5% APR) │          │  @ 120%   │    │
│ └─────────┘        └───────────┘          └───────────┘    │
│                                                             │
│   Interest = Principal × Rate × Time / Year                 │
│              (using stacks-block-time)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
04-sbtc-lending/
├── Clarinet.toml
├── contracts/
│   └── sbtc-lending.clar
├── tests/
│   └── sbtc-lending_test.ts
└── README.md
```

## 🚀 Quick Start

```bash
cd 04-sbtc-lending
clarinet check
clarinet test
clarinet console
```

### Console Examples

```clarity
;; Borrow 500 STX against 1000 STX collateral
(contract-call? .sbtc-lending borrow u1000000000 u500000000)

;; Check interest accrued
(contract-call? .sbtc-lending calculate-interest u1)

;; Check health factor
(contract-call? .sbtc-lending get-health-factor u1)

;; Add more collateral
(contract-call? .sbtc-lending add-collateral u1 u200000000)

;; Repay loan
(contract-call? .sbtc-lending repay u1 u300000000)
```

## 📋 Contract Functions

### Core Functions
| Function | Description |
|----------|-------------|
| `borrow` | Deposit collateral and borrow STX |
| `repay` | Repay loan (partial or full) |
| `add-collateral` | Add more collateral to loan |
| `liquidate` | Liquidate underwater positions |

### Admin Functions
| Function | Description |
|----------|-------------|
| `approve-collateral` | Whitelist collateral tokens |
| `set-sbtc-price` | Update price oracle (simulation) |

### Read-Only Functions
| Function | Description |
|----------|-------------|
| `calculate-interest` | Get accrued interest |
| `get-health-factor` | Check position health |
| `is-liquidatable` | Check if can be liquidated |
| `generate-loan-receipt` | Generate receipt string |

## 💡 Protocol Parameters

| Parameter | Value |
|-----------|-------|
| Minimum Collateral Ratio | 150% |
| Liquidation Threshold | 120% |
| Liquidation Bonus | 5% |
| Base Interest Rate | 5% APR |

## 🏆 Builder Challenge Points

- ✅ `stacks-block-time` for interest calculation
- ✅ `contract-hash?` for collateral verification
- ✅ `to-ascii?` for loan receipts
- ✅ Complete liquidation system
- ✅ Production-ready DeFi protocol

## 📜 License

MIT License
