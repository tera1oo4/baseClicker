# 🎮 Base Clicker — On-Chain Clicker Game

On-chain clicker game on Base with upgrades and leaderboard. Zero gas fees on Base L2.

## How it works

- **Click** the button to earn points (off-chain, instant)
- **Sync** your clicks to the blockchain (on-chain TX)
- **Buy upgrades** to boost your clicking power (on-chain TX)
- **Compete** on the global leaderboard (on-chain)

## Upgrades

| # | Name | Effect | Base Cost |
|---|------|--------|-----------|
| 1 | ✌️ Double Click | x2 per click | 100 |
| 2 | 🤖 Auto Clicker | +1 click/sec | 500 |
| 3 | 💎 Mega Tap | x5 per click | 2,000 |
| 4 | ⚡ Turbo Auto | x10 auto-clicker | 10,000 |
| 5 | 🙌 Diamond Hands | x2 to everything | 50,000 |

## Tech Stack

- **Frontend**: Vue 3 + Vite + Wagmi + Reown AppKit
- **Smart Contract**: Solidity 0.8.24 (Hardhat)
- **Chain**: Base (Coinbase L2)
- **Wallets**: MetaMask, Coinbase Wallet, WalletConnect (300+ wallets)

## Development

### Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Deploy contract (Base Sepolia testnet)
```bash
cd contracts
cp .env.example .env  # add DEPLOYER_KEY
npx hardhat ignition deploy ignition/modules/ClickerGame.ts --network baseSepolia
```

### Deploy frontend (Vercel)
1. Push to GitHub
2. Import in Vercel, set Root Directory = `clicker/frontend`
3. Add env vars: `VITE_WALLETCONNECT_PROJECT_ID`, `VITE_CLICKER_CONTRACT_ADDRESS`

## License
MIT
