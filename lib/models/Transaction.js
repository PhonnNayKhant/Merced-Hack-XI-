// lib/models/Transaction.js
// One document per on-chain transaction, keyed by Solana signature.
// `address` is the wallet that owns this cached record.
// Upserting by signature prevents duplicates when we sync from RPC.

import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  address: { type: String, required: true, index: true },
  signature: { type: String, required: true, unique: true },
  direction: { type: String, enum: ["sent", "received"], required: true },
  usdcAmount: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  explorerUrl: { type: String },
  savedAt: { type: Date, default: Date.now },
});

export const Transaction =
  mongoose.models.Transaction ??
  mongoose.model("Transaction", TransactionSchema);
