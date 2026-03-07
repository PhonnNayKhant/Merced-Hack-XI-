# 🛡️ SolShield 

**SolShield** is a minimalistic, non-custodial **Solana Web Wallet** built for the UC Merced Hackathon. It is extremely focused on handling **USDC transactions** flawlessly on the Solana Devnet.

It was originally built as a Vite SPA and recently migrated to a Next.js (App Router) structure to better support backend API route generation (for gasless transactions and Solana Actions) as well as full-stack extensibility.

## 🚀 Features

* **Instant Wallet Generation**: Automatically generates and securely stores a Solana Keypair in the browser's `localStorage` on first load.
* **Auto-ATA Creation**: Uses `@solana/spl-token` to verify if a recipient already holds a USDC token account. If not, it gracefully creates an Associated Token Account (ATA) for them on the fly before executing the transfer.
* **Live Network Interaction**: Integrates with `@solana/web3.js` to fetch current SOL and Devnet USDC balances instantly.
* **Smart UI**: Validates Solana addresses in the input field, ensures sufficient USDC balance before allowing a transfer, and generates a dynamic QR Code representation of your public key.
* **Built-in Faucet**: Includes an easy one-click Devnet SOL airdrop button to instantly fund your wallet with gas money.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Custom CSS Modules (Monospace aesthetics)
- **Blockchain SDK**: `@solana/web3.js` & `@solana/spl-token`
- **Utilities**: `qrcode.react`, `bs58`

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Open the App
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Repository Structure
- `app/page.jsx`: The main user interface, including the Receive/Send forms.
- `hooks/useWallet.js`: Custom React hook that connects components to the blockchain and manages state.
- `lib/solana.js`: The core blockchain layer handling RPC network connections, SPL Token interactions, and transaction signatures.
- `lib/wallet.js`: Manages cryptographic keypair generation, local storage, import, and export.

## 🔮 Future Expansion (Hackathon Roadmap)
- **Gasless Transactions**: Setup a Next.js API Route to act as a Fee Payer, removing the need for users to hold generic SOL.
- **Solana Blinks**: Create standard endpoints so the wallet can seamlessly interact with specific URLs directly on Social Media (X/Twitter).
- **Transaction History**: Implement the frontend to parse and render past transactional RPC data.
- **Mainnet Toggle**: Allow instant switching between Devnet and Mainnet-Beta.
