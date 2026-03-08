// wallet.js — SolShield Keypair Management
// Handles: create, save, load, export wallet

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import CryptoJS from "crypto-js";

const STORAGE_KEY = "solshield_keypair";

/**
 * Load existing wallet from localStorage, or create a new one.
 * Returns a Keypair object.
 */
export function loadOrCreateWallet() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    const secretKey = Uint8Array.from(JSON.parse(stored));
    return Keypair.fromSecretKey(secretKey);
  }

  // First visit — generate new keypair
  const keypair = Keypair.generate();
  saveWallet(keypair);
  return keypair;
}

/**
 * Save keypair secret key to localStorage.
 */
export function saveWallet(keypair) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(Array.from(keypair.secretKey))
  );
}

/**
 * Delete wallet from localStorage (logout / reset).
 */
export function clearWallet() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export wallet as base58 private key string (for backup).
 * Show this to the user as their "seed" / backup key.
 */
export function exportPrivateKey(keypair) {
  return bs58.encode(keypair.secretKey);
}

/**
 * Import wallet from base58 private key string.
 */
export function importFromPrivateKey(base58Key) {
  const secretKey = bs58.decode(base58Key);
  const keypair = Keypair.fromSecretKey(secretKey);
  saveWallet(keypair);
  return keypair;
}

/**
 * Get public address string from keypair.
 */
export function getAddress(keypair) {
  return keypair.publicKey.toBase58();
}

/**
 * Generate a new wallet and encrypt its private key with a PIN
 */
export function generateAndEncryptWallet(pin) {
  const keypair = Keypair.generate();
  const address = keypair.publicKey.toBase58();
  const privateKeyString = bs58.encode(keypair.secretKey);

  // Encrypt the private key string using AES and the user's PIN
  const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKeyString, pin).toString();

  return {
    address,
    encryptedPrivateKey,
    keypair // Return raw keypair for immediate use in initial session
  };
}

/**
 * Decrypt a wallet's private key using a PIN
 */
export function decryptWallet(encryptedPrivateKey, pin) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, pin);
    const decryptedKeyString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedKeyString) {
      throw new Error("Invalid PIN or corrupted key");
    }

    const secretKey = bs58.decode(decryptedKeyString);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error("Failed to decrypt wallet. Invalid PIN.");
  }
}
