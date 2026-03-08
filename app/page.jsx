"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { useWallet } from "@/hooks/useWallet";
import { ArrowUp, ArrowDown, HelpCircle, ShieldCheck, X, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import ChatBox from "@/app/components/ChatBox";
import LanguageSelector from "@/app/components/LanguageSelector";

export default function MinimalDashboard() {
  const {
    address,
    usdcBalance,
    solBalance,
    transactions,
    loading,
    sending,
    sendUSDC,
    isValidAddress,
    error,
    refreshBalances
  } = useWallet();

  const [activeModal, setActiveModal] = useState(null); // 'send', 'receive', null
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [sendStep, setSendStep] = useState('input'); // 'input', 'scanning', 'confirm'

  // Cloud Wallet State
  const [pin, setPin] = useState("");
  const [setupError, setSetupError] = useState(null);
  const [settingUp, setSettingUp] = useState(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  // Mock Favorite Contacts logic
  const favoriteContacts = []; // Empty for demo purposes so it always shows warning
  const isFavorite = favoriteContacts.includes(recipient);

  const displayBalance = loading || usdcBalance === null ? "..." : usdcBalance.toFixed(2);
  const accountCode = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Loading...";

  const recipientValid = recipient.length > 0 && isValidAddress(recipient);
  const amountValid = parseFloat(amount) > 0 && parseFloat(amount) <= (usdcBalance || 0);
  const canSend = recipientValid && amountValid && !sending;

  const receiptRef = useRef(null);

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `SolShield-Receipt-${txSig?.slice(0, 8) || 'tx'}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate receipt", err);
    }
  };

  function initiateSecurityScan() {
    setSendStep('scanning');
    setTimeout(() => {
      setSendStep('confirm');
    }, 1500);
  }

  async function handleSend() {
    setSendError(null);
    try {
      const sig = await sendUSDC(recipient, parseFloat(amount));
      setTxSig(sig);
    } catch (e) {
      setSendError(e.message);
      setSendStep('confirm');
    }
  }

  function resetSend() {
    setRecipient("");
    setAmount("");
    setTxSig(null);
    setSendError(null);
    setSendStep('input');
    setActiveModal(null);
  }

  function formatDate(isoString) {
    if (!isoString) return "Unknown";
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Check for Cloud Wallet on Load
  useEffect(() => {
    async function checkWallet() {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        const res = await fetch(`/api/wallet?clerkId=${user.id}`);
        if (res.status === 404) {
          // User doesn't exist in DB, trigger setup modal
          setActiveModal('welcome');
          setIsCheckingWallet(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          // Wallet exists in DB. If they don't have it locally (e.g. new device), we need to import it.
          // For now, if the hook hasn't loaded a local address, they need to enter pin to decrypt (Not implemented in this exact step yet, but prevents showing welcome modal)
          setIsCheckingWallet(false);
        }
      } catch (err) {
        console.error("Failed to check wallet:", err);
        setIsCheckingWallet(false);
      }
    }

    checkWallet();
  }, [isLoaded, isSignedIn, user]);

  // Handle Cloud Wallet Setup
  async function handleCloudWalletSetup(e) {
    e.preventDefault();
    setSetupError(null);

    if (!user) return setSetupError("Must be logged in.");

    // Basic validation
    if (pin.length !== 6 || !/^\d+$/.test(pin)) return setSetupError("PIN must be exactly 6 digits.");

    setSettingUp(true);

    try {
      // 1. Generate and encrypt new wallet using the util we just made
      const { generateAndEncryptWallet, saveWallet } = await import('@/lib/wallet');
      const { address: newAddress, encryptedPrivateKey, keypair } = generateAndEncryptWallet(pin);

      // 2. Send to backend
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          walletAddress: newAddress,
          encryptedPrivateKey
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create cloud wallet");
      }

      // 3. Save to local storage for current session
      saveWallet(keypair);

      // 4. Force a reload so useWallet hook picks up the new Keypair
      window.location.reload();

    } catch (error) {
      setSetupError(error.message);
      setSettingUp(false);
    }
  }

  if (!isLoaded || isCheckingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8 relative">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center pt-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t("appName")}</h1>
            <p className="text-sm text-gray-500">{t("tagline")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshBalances} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <RefreshCw size={18} className={loading && address ? "animate-spin" : ""} />
            </button>
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <ShieldCheck size={16} />
              <span>{t("protected")}</span>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Primary Balance Card */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mt-8">
          <p className="text-gray-500 font-medium mb-2">{t("availableBalance")}</p>
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-2">
            ${displayBalance}
          </h2>
          <p className="text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full text-sm">
            {t("digitalDollars")}
          </p>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveModal('receive')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 active:shadow-sm"
          >
            <ArrowDown size={20} />
            {t("receive")}
          </button>
          <button
            onClick={() => setActiveModal('send')}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-4 rounded-2xl font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 active:bg-gray-100"
          >
            <ArrowUp size={20} />
            {t("send")}
          </button>
        </section>

        {/* Account Info */}
        <section className="bg-white rounded-2xl p-4 flex justify-between items-center border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => address && navigator.clipboard.writeText(address)}>
          <span className="text-gray-500 text-sm">{t("receivingCode")}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-900 font-medium">{accountCode}</span>
            <Copy size={16} className="text-gray-400" />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="pt-4 space-y-3 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("recentActivity")}</h3>

          {loading && !transactions.length ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
              {t("loadingTransactions")}
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
              {t("noTransactions")}
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{tx.direction || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold ${tx.direction === 'received' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.direction === 'received' ? '+' : '-'}${tx.usdcAmount?.toFixed(2) || "0.00"}
                  </span>
                  <a href={tx.explorerUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Modals overlay */}
      {activeModal === 'receive' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{t("receiveUSDC")}</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                <QRCodeSVG value={address || ""} size={200} />
              </div>
              <div className="w-full bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <p className="font-mono text-sm break-all text-gray-700">{address}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Copy size={20} /> {t("copyAddress")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Modal ── */}
      {activeModal === 'send' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{t("sendUSDC")}</h3>
              <button onClick={resetSend} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>

            {txSig ? (
              <div className="py-2 space-y-6">
                {/* The element to capture */}
                <div ref={receiptRef} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  {/* Decorative background circle */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl"></div>

                  <div className="relative z-10 text-center space-y-4">
                    <div className="flex justify-center items-center gap-2 mb-2">
                      <ShieldCheck className="text-green-600" size={24} />
                      <h2 className="text-xl font-bold tracking-tight text-gray-900">SolShield</h2>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Transaction Receipt</p>
                      <h4 className="text-4xl font-black text-gray-900">${parseFloat(amount).toFixed(2)}</h4>
                      <p className="text-sm text-gray-400 font-medium">USDC Sent</p>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-4"></div>

                    <div className="space-y-3 text-sm text-left px-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-900">{new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">To</span>
                        <span className="font-mono text-gray-900">{recipient.slice(0, 4)}...{recipient.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Network Fee</span>
                        <span className="font-medium text-green-600">Covered ($0.00)</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-gray-500 text-xs">Transaction ID</span>
                        <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer" className="font-mono text-xs text-blue-500 hover:text-blue-700 truncate max-w-[140px]">
                          {txSig.slice(0, 20)}...
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={downloadReceipt} className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Save
                  </button>
                  <button onClick={resetSend} className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm">
                    Done
                  </button>
                </div>
              </div>
            ) : sendStep === 'scanning' ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Loader2 size={40} className="animate-spin" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Security Scan</h4>
                  <p className="text-gray-500 text-sm mt-2 max-w-[250px] mx-auto">Verifying recipient address against SolShield security databases...</p>
                </div>
              </div>
            ) : sendStep === 'confirm' ? (
              <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-center">
                  <h4 className="text-xl font-bold">Review Transfer</h4>
                  <p className="text-gray-500 text-sm mt-1">Please confirm the details below.</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-gray-900">${parseFloat(amount).toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">To</span>
                    <span className="font-mono text-gray-900">{recipient.slice(0, 6)}...{recipient.slice(-6)}</span>
                  </div>
                </div>

                {isFavorite ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 flex gap-3 items-start">
                    <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
                    <div>
                      <h5 className="font-semibold text-sm text-green-800">Address Verified: Safe to Send</h5>
                      <p className="text-xs mt-1 text-green-700/80">This address is in your Favorite Contacts.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-200 flex gap-3 items-start">
                    <AlertTriangle className="shrink-0 mt-0.5 text-yellow-600" size={20} />
                    <div>
                      <h5 className="font-semibold text-sm">First time sending to this address.</h5>
                      <p className="text-xs mt-1 text-yellow-700/80">Please double-check the code. Cryptocurrency transactions cannot be reversed.</p>
                    </div>
                  </div>
                )}

                {sendError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
                    {sendError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setSendStep('input')} className="flex-[0.4] bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200">
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className={`flex-1 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${sending ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-95 text-white shadow-md'}`}
                  >
                    {sending && <Loader2 size={18} className="animate-spin" />}
                    {sending ? 'Sending...' : 'Confirm & Send'}
                  </button>
                </div>
                <h4 className="text-2xl font-bold">Sent!</h4>
                <p className="text-gray-500">${parseFloat(amount).toFixed(2)} USDC was sent successfully.</p>
                <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline block my-4">View on Explorer</a>
                <button onClick={resetSend} className="w-full bg-gray-100 text-gray-900 font-semibold py-4 rounded-xl hover:bg-gray-200">Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{t("recipientAddress")}</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={t("solanaAddressPlaceholder")}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900"
                  />
                  {recipient.length > 0 && !isValidAddress(recipient) && <p className="text-red-500 text-xs mt-1">{t("invalidAddress")}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-sm font-medium text-gray-700">{t("amountUSDC")}</label>
                    <span className="text-xs text-gray-500 font-medium">{t("bal")}: ${displayBalance}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 pl-8 font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900"
                    />
                    <button onClick={() => setAmount(String(usdcBalance))} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm hover:text-blue-800">{t("max")}</button>
                  </div>
                  {amount.length > 0 && parseFloat(amount) > (usdcBalance || 0) && <p className="text-red-500 text-xs mt-1">{t("insufficientFunds")}</p>}
                </div>

                {sendError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {sendError}
                  </div>
                )}

                <button
                  onClick={initiateSecurityScan}
                  disabled={!canSend}
                  className={`w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all duration-200 ${canSend ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-95 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {sending ? 'Sending...' : 'Confirm Send'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI Chat Widget ── */}
      <ChatBox />
    </div>
  );
}