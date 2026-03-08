// lib/models/User.js
// One document per wallet address.
// Created automatically on first visit via the /api/user upsert.

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  address: { type: String, required: false, unique: true, sparse: true, index: true }, // Keep for backwards compatibility, but not strictly required now
  clerkId: { type: String, required: true, unique: true, index: true },
  walletAddress: { type: String, required: true, unique: true },
  alias: { type: String, unique: true, sparse: true }, // Optional display name; sparse index allows multiple null values
  encryptedPrivateKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  language: { type: String, default: "en" },
  onboardingComplete: { type: Boolean, default: false },
});

// Prevent model re-compilation on Next.js hot reload
export const User =
  mongoose.models.User ?? mongoose.model("User", UserSchema);
