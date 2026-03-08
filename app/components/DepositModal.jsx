"use client";

import { useState, useCallback } from "react";
import { X, Copy, Check, Zap, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "@/app/contexts/TranslationContext";

/**
 * DepositModal
 * Props:
 *   address       – the user's Solana wallet address (string)
 *   solBalance    – current SOL balance (number | null)
 *   onClose       – () => void  — called when the modal is dismissed
 *   onAirdrop     – async () => void — calls useWallet().airdropSOL and refreshes
 */
export default function DepositModal({ address, solBalance, onClose, onAirdrop }) {
    const { t } = useTranslation();

    const [copied, setCopied] = useState(false);
    const [airdropState, setAirdropState] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
    const [airdropError, setAirdropError] = useState(null);

    // ── Copy address to clipboard ─────────────────────────────────
    const handleCopy = useCallback(async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for browsers that block clipboard without HTTPS
            const el = document.createElement("textarea");
            el.value = address;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [address]);

    // ── Request Devnet Airdrop ────────────────────────────────────
    const handleAirdrop = useCallback(async () => {
        if (airdropState === "loading") return;
        setAirdropState("loading");
        setAirdropError(null);
        try {
            await onAirdrop(); // calls useWallet().airdropSOL which also refreshes
            setAirdropState("success");
        } catch (err) {
            setAirdropError(err?.message || t("airdropError"));
            setAirdropState("error");
        }
    }, [airdropState, onAirdrop, t]);

    const shortAddress = address
        ? `${address.slice(0, 8)}...${address.slice(-8)}`
        : "—";

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex justify-between items-start p-6 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{t("depositTitle")}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{t("depositSubtitle")}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition-colors -mt-1 -mr-1 ml-3 shrink-0"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-5">

                    {/* ── QR Code ──────────────────────────────────────────── */}
                    <div className="flex justify-center">
                        <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-sm inline-block">
                            {address ? (
                                <QRCodeSVG
                                    value={address}
                                    size={188}
                                    bgColor="#ffffff"
                                    fgColor="#111827"
                                    level="H"
                                    includeMargin={false}
                                />
                            ) : (
                                <div className="w-[188px] h-[188px] flex items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Address + Copy ───────────────────────────────────── */}
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="px-4 pt-3 pb-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Wallet Address
                            </p>
                        </div>
                        <div className="flex items-center gap-3 px-4 pb-3">
                            <p className="font-mono text-sm text-gray-800 break-all flex-1">
                                {address || "Loading..."}
                            </p>
                            <button
                                onClick={handleCopy}
                                aria-label="Copy address"
                                className={`shrink-0 flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200 ${copied
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95"
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={15} />
                                        {t("copied")}
                                    </>
                                ) : (
                                    <>
                                        <Copy size={15} />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Airdrop Button / State ───────────────────────────── */}
                    {airdropState === "success" ? (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-green-800 text-sm">{t("airdropSuccess")}</p>
                                <p className="text-green-700 text-xs mt-0.5">
                                    Your SOL balance has been updated.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleAirdrop}
                            disabled={airdropState === "loading" || !address}
                            className={`w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 ${airdropState === "loading" || !address
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                                }`}
                        >
                            {airdropState === "loading" ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {t("airdropProcessing")}
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    {t("requestDevnetSOL")}
                                </>
                            )}
                        </button>
                    )}

                    {/* Airdrop error */}
                    {airdropState === "error" && airdropError && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-red-600 text-sm">{airdropError}</p>
                        </div>
                    )}

                    {/* ── Devnet Notice ─────────────────────────────────────── */}
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={15} />
                        <p className="text-amber-700 text-xs leading-relaxed">
                            {t("devnetNotice")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
