# 🛡️ SolShield

**SolShield** is a minimalistic, secure, non-custodial **Solana Web Wallet** focused entirely on seamless **USDC** transactions. Built with the **Next.js App Router**, it offers a fast and premium user experience out of the box, tailored for users interacting with digital dollars on the Solana blockchain.

Currently configured for the **Solana Devnet**, it serves as a robust lightweight financial application showcasing secure authentication, encrypted cloud wallet storage, AI-powered translations, and intuitive blockchain interactions without overwhelming users with complex crypto terminology.

---

## ✨ Features

- **Secure Cloud Wallets**: Solana Keypairs are generated in-browser, encrypted locally using `crypto-js` AES encryption (via a 6-digit user PIN), and safely stored in MongoDB.
- **Seamless Authentication**: Integration with **Clerk** (`@clerk/nextjs`) provides a secure, modern, and frictionless user sign-in flow that ties directly to their encrypted cloud wallet.
- **USDC-First UX**: Prioritizes USDC (Digital Dollars) for sending and receiving, streamlining the experience for real-world fiat equivalency rather than volatile crypto assets.
- **Smart Transfers (ATA Creation)**: Automatically checks and creates Associated Token Accounts (ATA) for recipients if they don't have one, preventing common transaction failures when sending tokens to new addresses.
- **AI-Powered Translations**: Integrated **Google Generative AI** understands context to dynamically translate the UI into multiple languages (English, Spanish, French, Japanese, etc.) on the fly.
- **Beautiful, Premium Dashboard**: A clean, responsive UI built with Tailwind CSS and Lucide Icons. Features an intuitive "Send" and "Receive" flow with QR code integration.
- **Receipt Generation**: Users can instantly download professional, image-based transaction receipts upon successfully sending USDC (powered by `html2canvas`).

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database Backend**: MongoDB via Mongoose
- **Blockchain**: `@solana/web3.js`, `@solana/spl-token` (Solana Devnet)
- **AI / Translations**: `@google/generative-ai`
- **Security**: AES encryption (`crypto-js`)
- **Utilities**: `bs58`, `qrcode.react`, `html2canvas`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB Cluster URL
- Clerk API Keys
- Google Gemini API Key

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
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.../solshield
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   
   # AI Translator
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Architecture

- `/app`: Next.js App Router pages, global layouts, Clerk authentication middleware, and API routes (`/api/wallet`).
- `/lib`: Core backend logic and Mongoose models (`User.js`).
  - `wallet.js`: Manages cryptographic keypair creation, base58 encoding, and the critical **AES encryption/decryption** algorithms for cloud synchronization.
  - `solana.js`: Handles communication with the Solana blockchain (RPC connection, checking balances, confirming transactions, transferring SPL tokens).
  - `mongodb.js`: Establishes the Mongoose connection singleton for the Next.js serverless backend.
- `/hooks`: Custom React Hooks.
  - `useWallet.js`: Serves as the crucial bridge between the static `/lib` functions and the React UI for managing global blockchain state.
- `/contexts`: Global state providers like `TranslationContext` for AI-powered UI text updates.

## 🔒 Security Posture

*Disclaimer: SolShield is an evolving project.*  
To prioritize security over simple `localStorage` retention, SolShield requires users to define a **6-Digit Secure PIN**. The Solana Keypair's secret key is run through an AES encryption cycle using `crypto-js` *on the client-side* before being sent to the `/api/wallet` route. **The backend only ever stores the highly encrypted ciphertext string**, meaning the plain-text private key never touches the database. 

## 💡 Future Roadmap
- Mainnet integration toggle
- Implement "Returning User" decryption flow using Clerk User ID
- Address book/favorites saved directly via the MongoDB backend
- Solana Blinks / Actions integration
