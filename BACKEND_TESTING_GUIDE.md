# 🚀 SolShield Backend & Testing Guide

This guide explains what the "Backend" means for a Next.js/Solana application like SolShield, how to write Next.js API Routes to interact with the blockchain automatically, and finally, how to push your code to GitHub to share it with the judges.

---

## 🏗️ 1. Understanding the "Backend" in Next.js + Solana

Because you are using Next.js (App Router), your application is truly **Full-Stack**. 

Your `app/page.jsx` and `hooks/useWallet.js` represent the **Frontend** (Client-side). They run entirely in the user's browser. Right now, this frontend talks *directly* to the Solana Blockchain (using `lib/solana.js`). 

A true **Backend** endpoint (Server-side) is an API route that runs on a Vercel server or your local Node.js server. 

### Why do you need a Backend API?
1. **Security (Gasless Transactions / Fee Payer)**: To pay for your users' transactions automatically, you need a "Master Wallet" loaded with real SOL. You **cannot** put the Private Key to this Master Wallet in the Frontend, or anyone visiting your website could steal all of its SOL. The Private Key must live safely in a Backend API.
2. **Solana Actions (Blinks)**: To create a Solana Blink (a link you can share on Twitter that allows users to click a button and send USDC right inside their timeline), you must create public backend API endpoints (`GET` and `POST`) that return specific JSON data structures mandated by Solana.

---

## 💻 2. How to create a Backend Endpoint to test Solana

Let's build a simple backend endpoint that checks the balance of the master wallet.

### Step 1: Create the API Route File
In Next.js App Router, you create APIs by creating a file named `route.js` inside an `app/api/...` directory.

1. Go to your project folder.
2. Create `app/api/master-balance/route.js`. 
3. Add this code to it:

```javascript
// app/api/master-balance/route.js
import { NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export async function GET(request) {
  // 1. Define the connection to the Devnet
  const connection = new Connection(clusterApiUrl('devnet'));

  // 2. Define your master wallet address
  // (In production, you'd load a private key from env variables here)
  const masterWalletPubkey = new PublicKey("YOUR_PUBLIC_KEY_HERE"); 

  try {
    // 3. Ask the blockchain for the balance in Lamports
    const balanceLamports = await connection.getBalance(masterWalletPubkey);
    
    // 4. Convert Lamports to SOL (1 SOL = 1,000,000,000 Lamports)
    const balanceSOL = balanceLamports / 1000000000;

    // 5. Return JSON to the client
    return NextResponse.json({ 
      success: true, 
      wallet: masterWalletPubkey.toBase58(),
      balanceSOL: balanceSOL 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### Step 2: Test the API Endpoint
1. Ensure your Next.js development server is running (`npm run dev`).
2. Open a new browser tab.
3. Simply navigate to your new backend URL: `http://localhost:3000/api/master-balance`
4. You should see a raw JSON response directly from the Solana blockchain!

---

## 🧪 3. Testing with Real SolShield Wallets

To truly test the flow of SolShield during the Hackathon without spending real money, you are using the **Solana Devnet**.

### A. How to get a testing opponent
Your app generated a wallet for you automatically. But how do you test sending USDC?
1. Open your app on your laptop (`localhost:3000`). This is **Wallet A**.
2. Open an "Incognito" or "Private Browsing" window and go to `localhost:3000`. This will generate a completely fresh, empty keypair (**Wallet B**) because the `localStorage` is completely separated.
3. Click the "Copy Address" button in Wallet B.
4. Go back to Wallet A, click Send, paste Wallet B's address, and send them $10 USDC. 

### B. Funding wallets for testing
If a wallet runs out of gas (SOL):
1. Click the "Airdrop 1 SOL (devnet)" button in your app's frontend.
2. OR, copy your wallet address and visit the official [Solana Faucet](https://faucet.solana.com/) to manually spray it with 5 Devnet SOL instantly.

---

## 🐙 4. Publishing Your Project to GitHub

To share your code with Hackathon judges (or host it live on Vercel), you need to initialize a Git repository and push it to GitHub.

### Step 1: Initialize Git Locally
Open your terminal inside the `d:\UC Merced Hackathon\Merced-Hack-XI-` folder and run:
```bash
# 1. Initialize a new empty Git repository
git init

# 2. Stage all your current files (except node_modules, which Next.js ignores automatically)
git add .

# 3. Create your first save point
git commit -m "First commit: Initialized Next.js SolShield wallet UI"
```

### Step 2: Create a Repository on GitHub.com
1. Go to [GitHub.com](https://github.com/) and click the big green **"New"** button in the top left.
2. Name the repository `solshield-wallet`.
3. Keep it **Public** (so judges can see it).
4. **DO NOT** check the box "Add a README file" (we already made you a great one locally!).
5. Click **Create repository**.

### Step 3: Push Your Code Up!
GitHub will show you a page with instructions. Copy the three commands under the heading **"…or push an existing repository from the command line"** and paste them into your terminal. They will look exactly like this:

```bash
# Replace YOUR_USERNAME with your actual GitHub username!
git remote add origin https://github.com/YOUR_USERNAME/solshield-wallet.git
git branch -M main
git push -u origin main
```

*(You may be prompted to log in to GitHub in your terminal via a popup window).*

### Step 4: Host it for Free
Because you chose Next.js, hosting is incredibly easy:
1. Go to [Vercel.com](https://vercel.com/) and Log in with your GitHub account.
2. Click **Add New Project**.
3. Import your `solshield-wallet` repository from the list.
4. Click **Deploy**. In 2 minutes, you will have a live URL to show off to anyone at the Hackathon!
