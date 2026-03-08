// lib/models/User.js
// One document per wallet address.
// Created automatically on first visit via the /api/user upsert.

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  language: { type: String, default: "en" },
  onboardingComplete: { type: Boolean, default: false },
});

// Prevent model re-compilation on Next.js hot reload
export const User =
  mongoose.models.User ?? mongoose.model("User", UserSchema);
