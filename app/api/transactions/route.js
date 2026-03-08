// app/api/transactions/route.js
// GET  /api/transactions?address=xxx  → return cached tx history (fast, no RPC)
// POST /api/transactions              → upsert batch of txs from RPC into cache

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/lib/models/Transaction";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  await connectDB();

  const txs = await Transaction.find({ address })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean(); // .lean() returns plain JS objects, faster than full Mongoose docs

  return NextResponse.json(txs);
}

export async function POST(request) {
  const { address, transactions } = await request.json();

  if (!address || !transactions?.length) {
    return NextResponse.json(
      { error: "address and transactions array required" },
      { status: 400 }
    );
  }

  await connectDB();

  // Upsert each tx by signature — skips duplicates, no double-saves
  const ops = transactions.map((tx) => ({
    updateOne: {
      filter: { signature: tx.signature },
      update: { $setOnInsert: { address, ...tx } },
      upsert: true,
    },
  }));

  await Transaction.bulkWrite(ops);

  return NextResponse.json({ saved: transactions.length });
}
