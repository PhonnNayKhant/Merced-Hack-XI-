# 🛡️ SolShield

**SolShield** is a minimalistic, secure, non-custodial **Solana Web Wallet** focused entirely on seamless **USDC** transactions. Built with Next.js, it offers a fast and premium user experience out of the box, tailored for users interacting with digital dollars on the Solana blockchain.

Currently configured for the **Solana Devnet**, it serves as a lightweight financial application showcasing easy onboarding, intuitive UX, and robust blockchain interactions without overwhelming users with complex crypto terminology.

---

## ✨ Features

- **Automatic Wallet Generation**: Instantly generates a Solana Keypair for new users upon first visit. No complex seed phrase onboarding required to get started (key securely stored locally).
- **USDC-First UX**: Prioritizes USDC (Digital Dollars) for sending and receiving, streamlining the experience for real-world fiat equivalency rather than volatile crypto assets.
- **Smart Transfers (ATA Creation)**: Automatically checks and creates Associated Token Accounts (ATA) for recipients if they don't have one, preventing common transaction failures when sending tokens to new addresses.
- **Beautiful, Premium Dashboard**: A clean, responsive UI built with Tailwind CSS and Lucide Icons. Features an intuitive "Send" and "Receive" flow with QR code integration.
- **Receipt Generation**: Users can instantly download professional, image-based transaction receipts upon successfully sending USDC (powered by `html2canvas`).
- **Activity Tracking**: Real-time transaction history fetching to show incoming and outgoing transfers with explorer links.

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Blockchain**: `@solana/web3.js`, `@solana/spl-token` (Solana Devnet)
- **Database/Backend (Prepared)**: MongoDB via Mongoose (Ready for backend user/contact management scaling)
- **Utilities**: `bs58`, `qrcode.react`, `html2canvas`

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd Merced-Hack-XI-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and define the following variables:
   ```env
   # MongoDB Connection String (For existing or future backend features)
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.../solshield
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

### 3. Open the App
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Architecture

- `/app`: Next.js App Router pages and API routes. The primary UI is in `page.jsx`.
- `/lib`: Core utility functions holding the business logic.
  - `solana.js`: Handles communication with the Solana blockchain (RPC connection, checking balances, confirming transactions, transferring SPL tokens).
  - `wallet.js`: Manages cryptographic keypair creation, base58 encoding, and local browser storage.
  - `mongodb.js`: Establishes the Mongoose connection singleton for the Next.js backend.
- `/hooks`: Custom React Hooks.
  - `useWallet.js`: Serves as the crucial bridge between the static `/lib` functions and the React UI. It manages blockchain state, loading indicators, and exposes clean functions to the UI layer.

## 🔒 Security Note

*Disclaimer: SolShield is currently built as a Hackathon prototype / Proof of Concept.*  
Private keys currently reside in browser `localStorage` in raw or base58 formats. While highly accessible, this is not recommended for Maineet financial applications holding significant value without password-encryption or Wallet Adapter integration (e.g., Phantom/Backpack).

## 💡 Future Roadmap
- Mainnet integration toggle
- Implementation of password-encrypted local storage for the Keypair
- Address book/favorites saved directly via the MongoDB backend
- Solana Blinks / Actions integration
