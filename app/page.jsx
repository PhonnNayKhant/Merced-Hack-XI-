"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ArrowUp, ArrowDown, HelpCircle, ShieldCheck, X, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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

  const displayBalance = loading || usdcBalance === null ? "..." : usdcBalance.toFixed(2);
  const accountCode = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Loading...";

  const recipientValid = recipient.length > 0 && isValidAddress(recipient);
  const amountValid = parseFloat(amount) > 0 && parseFloat(amount) <= (usdcBalance || 0);
  const canSend = recipientValid && amountValid && !sending;

  async function handleSend() {
    setSendError(null);
    try {
      const sig = await sendUSDC(recipient, parseFloat(amount));
      setTxSig(sig);
    } catch (e) {
      setSendError(e.message);
    }
  }

  function resetSend() {
    setRecipient("");
    setAmount("");
    setTxSig(null);
    setSendError(null);
    setActiveModal(null);
  }

  // Format date relative
  function formatDate(isoString) {
    if (!isoString) return "Unknown";
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8 relative">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center pt-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">SolShield</h1>
            <p className="text-sm text-gray-500">Secure Savings</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshBalances} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <RefreshCw size={18} className={loading && address ? "animate-spin" : ""} />
            </button>
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <ShieldCheck size={16} />
              <span>Protected</span>
            </div>
          </div>
        </header>

        {/* Primary Balance Card */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mt-8">
          <p className="text-gray-500 font-medium mb-2">Available Balance</p>
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-2">
            ${displayBalance}
          </h2>
          <p className="text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full text-sm">
            Digital Dollars (USDC)
          </p>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveModal('receive')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-semibold transition-colors shadow-sm"
          >
            <ArrowDown size={20} />
            Receive
          </button>
          <button
            onClick={() => setActiveModal('send')}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-4 rounded-2xl font-semibold transition-colors shadow-sm"
          >
            <ArrowUp size={20} />
            Send
          </button>
        </section>

        {/* Account Info (Simplified) */}
        <section className="bg-white rounded-2xl p-4 flex justify-between items-center border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => address && navigator.clipboard.writeText(address)}>
          <span className="text-gray-500 text-sm">Your receiving code:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-900 font-medium">{accountCode}</span>
            <Copy size={16} className="text-gray-400" />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="pt-4 space-y-3 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

          {loading && !transactions.length ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
              No recent transactions
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
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Receive USDC</h3>
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
                <Copy size={20} /> Copy Address
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'send' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Send USDC</h3>
              <button onClick={resetSend} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>

            {txSig ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h4 className="text-2xl font-bold">Sent!</h4>
                <p className="text-gray-500">${parseFloat(amount).toFixed(2)} USDC was sent successfully.</p>
                <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline block my-4">View on Explorer</a>
                <button onClick={resetSend} className="w-full bg-gray-100 text-gray-900 font-semibold py-4 rounded-xl hover:bg-gray-200">Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Recipient Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Solana address..."
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900"
                  />
                  {recipient.length > 0 && !isValidAddress(recipient) && <p className="text-red-500 text-xs mt-1">Invalid Solana address</p>}
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-sm font-medium text-gray-700">Amount (USDC)</label>
                    <span className="text-xs text-gray-500 font-medium">Bal: ${displayBalance}</span>
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
                    <button onClick={() => setAmount(String(usdcBalance))} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm hover:text-blue-800">MAX</button>
                  </div>
                  {amount.length > 0 && parseFloat(amount) > (usdcBalance || 0) && <p className="text-red-500 text-xs mt-1">Insufficient funds</p>}
                </div>

                {sendError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {sendError}
                  </div>
                )}

                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all ${canSend ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {sending ? 'Sending...' : 'Confirm Send'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
