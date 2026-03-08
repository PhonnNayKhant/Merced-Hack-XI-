// solana.js — SolShield Blockchain Layer
// Handles: USDC balance, send USDC, transaction history
// Network: Devnet (swap RPC_URL to mainnet for production)

import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = splToken;

// ----------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------

// Devnet USDC mint address (use this for testing)
const USDC_MINT_DEVNET = new PublicKey(
  "EmqAcceETPyZhEYW3eXR3QP36soceUgyuASKWCL656ii"
);

// Mainnet USDC mint (swap when going live)
// const USDC_MINT_MAINNET = new PublicKey(
//   "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
// );

const USDC_MINT = USDC_MINT_DEVNET;

// Use env variable in production: import.meta.env.VITE_RPC_URL
const RPC_URL = clusterApiUrl("devnet");

// Singleton connection
let _connection = null;
export function getConnection() {
  if (!_connection) {
    _connection = new Connection(RPC_URL, "confirmed");
  }
  return _connection;
}

// ----------------------------------------------------------------
// BALANCE
// ----------------------------------------------------------------

/**
 * Get SOL balance for a wallet address (in SOL, not lamports).
 */
export async function getSOLBalance(publicKeyOrString) {
  const connection = getConnection();
  const pubkey =
    typeof publicKeyOrString === "string"
      ? new PublicKey(publicKeyOrString)
      : publicKeyOrString;

  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Get USDC balance for a wallet address.
 * Returns number (e.g. 12.50 for $12.50 USDC).
 * Returns 0 if token account doesn't exist yet.
 */
export async function getUSDCBalance(publicKeyOrString) {
  const connection = getConnection();
  const pubkey =
    typeof publicKeyOrString === "string"
      ? new PublicKey(publicKeyOrString)
      : publicKeyOrString;

  try {
    const tokenAddress = await getAssociatedTokenAddress(USDC_MINT, pubkey);
    const tokenAccount = await getAccount(connection, tokenAddress);
    // USDC has 6 decimal places
    return Number(tokenAccount.amount) / 1_000_000;
  } catch (e) {
    // Token account doesn't exist — user has never received USDC
    return 0;
  }
}

// ----------------------------------------------------------------
// SEND USDC
// ----------------------------------------------------------------

/**
 * Send USDC from sender keypair to recipient address.
 *
 * @param {Keypair} senderKeypair  - sender's keypair (signs the tx)
 * @param {string}  recipientAddress - recipient's public key (base58)
 * @param {number}  amount           - amount in USDC (e.g. 5.00)
 * @returns {string} transaction signature
 */
export async function sendUSDC(senderKeypair, recipientAddress, amount) {
  const connection = getConnection();
  const sender = senderKeypair.publicKey;
  const recipient = new PublicKey(recipientAddress);

  // USDC uses 6 decimal places
  const amountInMicroUSDC = Math.round(amount * 1_000_000);

  // Get sender's token account
  const senderTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    sender
  );

  // Get or create recipient's token account
  const recipientTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    recipient
  );

  const transaction = new Transaction();

  // Check if recipient token account exists — if not, create it
  try {
    await getAccount(connection, recipientTokenAccount);
  } catch {
    // Recipient doesn't have a USDC account yet — add create instruction
    transaction.add(
      createAssociatedTokenAccountInstruction(
        sender,              // payer (sender pays for account creation)
        recipientTokenAccount,
        recipient,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      sender,
      amountInMicroUSDC
    )
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = sender;

  // Sign and send
  transaction.sign(senderKeypair);
  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  );

  // Wait for confirmation
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

// ----------------------------------------------------------------
// TRANSACTION HISTORY
// ----------------------------------------------------------------

/**
 * Get recent transactions for a wallet address.
 * Returns array of simplified transaction objects.
 * Limit: last 20 transactions.
 */
export async function getTransactionHistory(publicKeyOrString, limit = 20) {
  const connection = getConnection();
  const pubkey =
    typeof publicKeyOrString === "string"
      ? new PublicKey(publicKeyOrString)
      : publicKeyOrString;

  // Get signatures
  const signatures = await connection.getSignaturesForAddress(pubkey, {
    limit,
  });

  if (signatures.length === 0) return [];

  // Fetch transaction details
  const txDetails = await connection.getParsedTransactions(
    signatures.map((s) => s.signature),
    { maxSupportedTransactionVersion: 0 }
  );

  // Parse into simple objects
  return txDetails
    .map((tx, i) => {
      if (!tx) return null;

      const sig = signatures[i].signature;
      const timestamp = tx.blockTime
        ? new Date(tx.blockTime * 1000).toISOString()
        : null;
      const fee = tx.meta?.fee / LAMPORTS_PER_SOL;
      const err = tx.meta?.err;

      // Try to extract USDC transfer info from parsed instructions
      let usdcAmount = null;
      let direction = null;
      let counterparty = null;

      const instructions = tx.transaction?.message?.instructions || [];
      for (const ix of instructions) {
        if (
          ix.program === "spl-token" &&
          ix.parsed?.type === "transferChecked"
        ) {
          const info = ix.parsed.info;
          if (info?.mint === USDC_MINT.toBase58()) {
            usdcAmount = Number(info.tokenAmount?.uiAmount);
            const myAddress = pubkey.toBase58();
            direction =
              info.authority === myAddress ? "sent" : "received";
            counterparty =
              direction === "sent" ? info.destination : info.authority;
          }
        }
      }

      return {
        signature: sig,
        timestamp,
        fee,
        status: err ? "failed" : "confirmed",
        usdcAmount,
        direction,
        counterparty,
        explorerUrl: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
      };
    })
    .filter(Boolean);
}

// ----------------------------------------------------------------
// AIRDROP (Devnet only — for testing)
// ----------------------------------------------------------------

/**
 * Request devnet SOL airdrop (needed to pay transaction fees).
 * Only works on devnet. Remove in production.
 */
export async function requestDevnetAirdrop(publicKeyOrString, solAmount = 1) {
  const connection = getConnection();
  const pubkey =
    typeof publicKeyOrString === "string"
      ? new PublicKey(publicKeyOrString)
      : publicKeyOrString;

  const sig = await connection.requestAirdrop(
    pubkey,
    solAmount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

// ----------------------------------------------------------------
// VALIDATE ADDRESS
// ----------------------------------------------------------------

/**
 * Check if a string is a valid Solana public key.
 */
export function isValidAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}