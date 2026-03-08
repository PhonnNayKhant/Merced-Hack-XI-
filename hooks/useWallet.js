// useWallet.js — SolShield React Hook
// Drop this into any component to access wallet state + actions
//
// Usage:
//   import { useWallet } from './hooks/useWallet'
//   const { address, usdcBalance, sendUSDC, loading } = useWallet()

import { useState, useEffect, useCallback } from "react";
import {
  loadOrCreateWallet,
  clearWallet,
  exportPrivateKey,
  importFromPrivateKey,
  getAddress,
} from "@/lib/wallet";
import {
  getUSDCBalance,
  getSOLBalance,
  sendUSDC as sendUSDCTx,
  getTransactionHistory,
  requestDevnetAirdrop,
  isValidAddress,
} from "@/lib/solana";

export function useWallet() {
  const [keypair, setKeypair] = useState(null);
  const [address, setAddress] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [solBalance, setSolBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // ── Init wallet on mount ──────────────────────────────────────
  useEffect(() => {
    // Check if user arrived via NFC card tap (?key=BASE58PRIVATEKEY in URL)
    const params = new URLSearchParams(window.location.search);
    const nfcKey = params.get("key");

    let kp;
    if (nfcKey) {
      try {
        kp = importFromPrivateKey(nfcKey); // imports and saves to localStorage
      } catch {
        kp = loadOrCreateWallet(); // fallback if the key in the URL is invalid
      }
      // Wipe the key from the URL immediately — don't leave it in browser history
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      kp = loadOrCreateWallet();
    }

    setKeypair(kp);
    setAddress(getAddress(kp));
  }, []);

  // ── Fetch balances when address is ready ─────────────────────
  useEffect(() => {
    if (!address) return;

    // 1. Register/fetch user profile (fire-and-forget, no UI impact)
    fetch(`/api/user?address=${address}`).catch(() => {});

    // 2. Load cached transactions from MongoDB immediately so the list
    //    isn't empty while we wait for the Solana RPC to respond
    fetch(`/api/transactions?address=${address}`)
      .then((r) => r.json())
      .then((cached) => {
        if (Array.isArray(cached) && cached.length > 0) {
          setTransactions(cached);
        }
      })
      .catch(() => {});

    // 3. Then fetch fresh data from RPC
    refreshBalances();
  }, [address]);

  // ── Refresh balances + tx history ────────────────────────────
  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [usdc, sol, txs] = await Promise.all([
        getUSDCBalance(address),
        getSOLBalance(address),
        getTransactionHistory(address, 20),
      ]);
      setUsdcBalance(usdc);
      setSolBalance(sol);
      setTransactions(txs);

      // Write fresh txs into MongoDB cache (fire-and-forget)
      if (txs.length > 0) {
        fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, transactions: txs }),
        }).catch(() => {});
      }
    } catch (e) {
      setError("Failed to load wallet data. Check your connection.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // ── Send USDC ─────────────────────────────────────────────────
  const sendUSDC = useCallback(
    async (recipientAddress, amount) => {
      if (!keypair) throw new Error("Wallet not loaded");
      if (!isValidAddress(recipientAddress))
        throw new Error("Invalid recipient address");
      if (amount <= 0) throw new Error("Amount must be greater than 0");
      if (amount > usdcBalance) throw new Error("Insufficient USDC balance");

      setSending(true);
      setError(null);
      try {
        const sig = await sendUSDCTx(keypair, recipientAddress, amount);
        await refreshBalances(); // refresh after send
        return sig;
      } catch (e) {
        const msg = e?.message || "Transaction failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setSending(false);
      }
    },
    [keypair, usdcBalance, refreshBalances]
  );

  // ── Devnet airdrop (testing only) ─────────────────────────────
  const airdropSOL = useCallback(async () => {
    if (!address) return;
    try {
      await requestDevnetAirdrop(address, 1);
      await refreshBalances();
    } catch (e) {
      setError("Airdrop failed — try faucet.solana.com");
    }
  }, [address, refreshBalances]);

  // ── Export private key ────────────────────────────────────────
  const exportKey = useCallback(() => {
    if (!keypair) return null;
    return exportPrivateKey(keypair);
  }, [keypair]);

  // ── Import wallet ─────────────────────────────────────────────
  const importWallet = useCallback((base58Key) => {
    const kp = importFromPrivateKey(base58Key);
    setKeypair(kp);
    setAddress(getAddress(kp));
  }, []);

  // ── Reset / logout ────────────────────────────────────────────
  const resetWallet = useCallback(() => {
    clearWallet();
    const kp = loadOrCreateWallet(); // generates new one
    setKeypair(kp);
    setAddress(getAddress(kp));
    setUsdcBalance(null);
    setSolBalance(null);
    setTransactions([]);
  }, []);

  return {
    // State
    address,
    usdcBalance,
    solBalance,
    transactions,
    loading,
    sending,
    error,

    // Actions
    sendUSDC,
    refreshBalances,
    airdropSOL,
    exportKey,
    importWallet,
    resetWallet,
    isValidAddress,
  };
}