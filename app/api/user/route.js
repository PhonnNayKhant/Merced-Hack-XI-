// app/api/user/route.js
// GET  /api/user?address=xxx  → find-or-create user profile
// POST /api/user              → update profile fields (language, onboarding, etc.)

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  await connectDB();

  // upsert: create the user if they don't exist yet, return the doc either way
  const user = await User.findOneAndUpdate(
    { address },
    { $setOnInsert: { address } },
    { upsert: true, new: true }
  );

  return NextResponse.json(user);
}

export async function POST(request) {
  const body = await request.json();
  const { address, ...updates } = body;

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { address },
    { $set: updates },
    { upsert: true, new: true }
  );

  return NextResponse.json(user);
}
