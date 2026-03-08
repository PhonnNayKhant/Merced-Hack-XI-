// app/api/user/sync/route.js
// POST /api/user/sync
// Upserts a User document in MongoDB keyed by their Clerk userId.
// Body: { walletAddress: string, alias?: string }

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(request) {
    // 1. Verify the user is authenticated via Clerk
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the request body
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { walletAddress, alias } = body;

    if (!walletAddress) {
        return NextResponse.json(
            { error: "walletAddress is required" },
            { status: 400 }
        );
    }

    // 3. Build the update object — only include alias if it was provided
    const updateFields = { walletAddress };
    if (alias !== undefined && alias !== null && alias !== "") {
        updateFields.alias = alias;
    }

    // 4. Connect to MongoDB and upsert the user document
    await connectDB();

    const user = await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: updateFields, $setOnInsert: { clerkId: userId } },
        { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, user });
}
