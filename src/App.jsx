import { useState } from "react";
import { useWallet } from "./hooks/useWallet";
import { QRCodeSVG } from 'qrcode.react';

export default function App() {
  const {
    address,
    usdcBalance,
    solBalance,
    airdropSOL,
    loading,
    sending,
    sendUSDC,
    isValidAddress,
    error,
  } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txSig, setTxSig] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [step, setStep] = useState("form"); // "form" | "confirm" | "success"

  const recipientValid = recipient.length > 0 && isValidAddress(recipient);
  const amountValid = parseFloat(amount) > 0 && parseFloat(amount) <= usdcBalance;
  const canSend = recipientValid && amountValid && !sending;

  async function handleSend() {
    setSendError(null);
    try {
      const sig = await sendUSDC(recipient, parseFloat(amount));
      setTxSig(sig);
      setStep("success");
    } catch (e) {
      setSendError(e.message);
    }
  }

  function reset() {
    setRecipient("");
    setAmount("");
    setTxSig(null);
    setSendError(null);
    setStep("form");
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace", maxWidth: 480 }}>
      <h1>🛡️ SolShield</h1>

      {/* Balances */}
      <div style={{ background: "#f4f4f4", padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <p><b>Address:</b> {address?.slice(0, 8)}...{address?.slice(-6)}</p>
        <p><b>USDC:</b> {loading ? "loading..." : `$${usdcBalance?.toFixed(2)}`}</p>
        <p><b>SOL:</b> {loading ? "loading..." : solBalance?.toFixed(4)}</p>
        <button onClick={airdropSOL} style={{ marginTop: 8, padding: "6px 12px" }}>
          Airdrop 1 SOL (devnet)
        </button>
      </div>

      {/* Receive Section */}
<div style={{ marginBottom: 24 }}>
  <h2>Receive USDC</h2>
  <p style={{ fontSize: 13, color: "#666" }}>Share this address to receive USDC</p>
  <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
    <QRCodeSVG value={address || ""} size={180} />
  </div>
  <div style={{
    background: "#f4f4f4",
    padding: 10,
    borderRadius: 6,
    fontSize: 11,
    wordBreak: "break-all",
    textAlign: "center"
  }}>
    {address}
  </div>
  <button
    onClick={() => navigator.clipboard.writeText(address)}
    style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 6, cursor: "pointer" }}
  >
    📋 Copy Address
  </button>
</div>

      {/* Send Flow */}
      {step === "form" && (
        <div>
          <h2>Send USDC</h2>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4 }}>Recipient Address</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Solana wallet address..."
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: recipient.length > 0
                  ? recipientValid ? "2px solid green" : "2px solid red"
                  : "1px solid #ccc",
                fontFamily: "monospace",
                fontSize: 13,
              }}
            />
            {recipient.length > 0 && !recipientValid && (
              <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>Invalid Solana address</p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Amount (USDC) — Balance: ${usdcBalance?.toFixed(2)}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: amount.length > 0
                  ? amountValid ? "2px solid green" : "2px solid red"
                  : "1px solid #ccc",
                fontFamily: "monospace",
                fontSize: 16,
              }}
            />
            {amount.length > 0 && !amountValid && (
              <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
                {parseFloat(amount) <= 0 ? "Amount must be greater than 0" : "Insufficient USDC balance"}
              </p>
            )}
            {/* Quick amount buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(String(Math.min(val, usdcBalance)))}
                  style={{ padding: "4px 10px", fontSize: 12, borderRadius: 4, cursor: "pointer" }}
                >
                  ${val}
                </button>
              ))}
              <button
                onClick={() => setAmount(String(usdcBalance))}
                style={{ padding: "4px 10px", fontSize: 12, borderRadius: 4, cursor: "pointer" }}
              >
                MAX
              </button>
            </div>
          </div>

          {sendError && (
            <p style={{ color: "red", background: "#fff0f0", padding: 10, borderRadius: 6 }}>
              ❌ {sendError}
            </p>
          )}

          <button
            onClick={() => setStep("confirm")}
            disabled={!canSend}
            style={{
              width: "100%",
              padding: 14,
              background: canSend ? "#4F46E5" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              cursor: canSend ? "pointer" : "not-allowed",
              fontFamily: "monospace",
            }}
          >
            Review Send →
          </button>
        </div>
      )}

      {/* Confirm Step */}
      {step === "confirm" && (
        <div>
          <h2>Confirm Transaction</h2>
          <div style={{ background: "#f4f4f4", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <p><b>To:</b> {recipient.slice(0, 8)}...{recipient.slice(-6)}</p>
            <p><b>Amount:</b> ${parseFloat(amount).toFixed(2)} USDC</p>
            <p style={{ fontSize: 12, color: "#666" }}>Network fee: ~$0.00025 (Solana)</p>
          </div>

          {sendError && (
            <p style={{ color: "red", background: "#fff0f0", padding: 10, borderRadius: 6 }}>
              ❌ {sendError}
            </p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep("form")}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" }}
            >
              ← Back
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                flex: 2,
                padding: 12,
                background: sending ? "#ccc" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                cursor: sending ? "not-allowed" : "pointer",
                fontFamily: "monospace",
              }}
            >
              {sending ? "⏳ Sending..." : "✅ Confirm & Send"}
            </button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {step === "success" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <h2>Sent!</h2>
          <p>${parseFloat(amount).toFixed(2)} USDC sent successfully</p>
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", marginTop: 8, color: "#4F46E5", fontSize: 13 }}
          >
            View on Solana Explorer →
          </a>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 24px",
              background: "#4F46E5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            Send Another
          </button>
        </div>
      )}
    </div>
  );
}