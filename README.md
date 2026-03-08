# 🛡️ SolShield

**SolShield** is a non-custodial **Solana USDC wallet** built for MercedHacks XI. It targets people in economically unstable regions (conflict zones, hyperinflation countries) who need to protect their savings in digital dollars — no bank account required.

> "SolShield is a financial safe harbor — a simple wallet that lets anyone in an unstable economy protect their savings in dollars, using nothing but their phone."

---

## 🚀 Features

- **Instant Wallet Generation** — generates a Solana keypair on first visit, stored in browser localStorage
- **Receive USDC** — displays a QR code of your public address
- **Send USDC** — enter recipient address + amount, sign and broadcast on-chain
- **Live Balances** — fetches USDC and SOL balances from Solana RPC in real time
- **Transaction History** — pulled from Solana RPC, cached in MongoDB Atlas
- **Auto-ATA Creation** — creates Associated Token Accounts for recipients automatically
- **Gemini AI Chatbot** — explains wallet features in plain language, supports 15 languages
- **Multilingual UI** — switch between English, Arabic, Ukrainian, Burmese, Dari, Somali, Amharic, Spanish and more
- **Devnet Airdrop** — one-click SOL airdrop for gas fees during testing

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Blockchain | `@solana/web3.js`, `@solana/spl-token` |
| Database | MongoDB Atlas + Mongoose |
| AI | Google Gemini API (`@google/generative-ai`) |
| Utilities | `qrcode.react`, `bs58`, `lucide-react` |

---

## 📦 Dependencies

```json
"@google/generative-ai": "^0.24.1",
"@solana/spl-token": "^0.4.14",
"@solana/web3.js": "^1.98.4",
"bs58": "^6.0.0",
"lucide-react": "^0.577.0",
"mongoose": "^9.2.4",
"next": "16.1.6",
"qrcode.react": "^4.2.0",
"react": "19.2.3",
"react-dom": "19.2.3"
```

---

## ⚙️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then fill in your values:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/solshield?retryWrites=true&w=majority
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Getting your MongoDB URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
2. Click **Connect** → **Drivers** → select **Node.js**
3. Copy the connection string and replace `<password>` with your DB user password
4. Add `solshield` as the database name before the `?`

**Getting your Gemini API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy and paste into `.env.local`

### 3. Run the development server

```bash
npm run dev
```

### 4. Open the app

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🗄️ MongoDB Setup

MongoDB Atlas stores two collections automatically on first use — no manual setup needed.

| Collection | What it stores |
|---|---|
| `users` | Wallet address, language preference, onboarding state |
| `transactions` | Cached USDC transaction history per wallet |

**To verify your connection is working:**

Visit `http://localhost:3000/api/user?address=test123` while the dev server is running. You should see a JSON response. Then check **Browse Collections** in Atlas to confirm the document was created.

---

## 📁 Project Structure

```
app/
  page.jsx                  # Main dashboard UI
  layout.js                 # Root layout
  api/
    ai/route.js             # Gemini AI — chat + translation
    user/route.js           # MongoDB user profile (GET/POST)
    transactions/route.js   # MongoDB transaction cache (GET/POST)
  components/
    ChatBox.jsx             # Floating AI chat widget
    LanguageSelector.jsx    # Language switcher dropdown
  contexts/
    TranslationContext.jsx  # Global translation state + Gemini translate
hooks/
  useWallet.js              # Wallet state, balances, send logic
lib/
  mongodb.js                # Mongoose connection singleton
  solana.js                 # Solana RPC + SPL Token interactions
  wallet.js                 # Keypair generation + localStorage
  models/
    User.js                 # Mongoose User schema
    Transaction.js          # Mongoose Transaction schema
```

---

## 🌐 Network

Currently running on **Solana Devnet**. To get test USDC:
1. Get devnet SOL from [faucet.solana.com](https://faucet.solana.com)
2. Get devnet USDC from [faucet.circle.com](https://faucet.circle.com)
