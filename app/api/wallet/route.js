import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

// POST /api/wallet
// Body: { clerkId, walletAddress, encryptedPrivateKey }
// Creates a new user with their encrypted cloud wallet
export async function POST(request) {
    try {
        const body = await request.json();
        const { clerkId, walletAddress, encryptedPrivateKey } = body;

        if (!clerkId || !walletAddress || !encryptedPrivateKey) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ clerkId });
        if (existingUser) {
            return NextResponse.json({ error: "User already registered" }, { status: 409 });
        }

        // Create new user
        const newUser = await User.create({
            clerkId,
            walletAddress,
            encryptedPrivateKey,
            address: walletAddress, // Set legacy field for backwards compatibility
            onboardingComplete: true
        });

        return NextResponse.json({
            success: true,
            user: {
                clerkId: newUser.clerkId,
                walletAddress: newUser.walletAddress
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating cloud wallet:", error);
        return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
    }
}

// GET /api/wallet?clerkId=user_2Nx...
// Fetches the encrypted private key and wallet address for login
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ clerkId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            walletAddress: user.walletAddress,
            encryptedPrivateKey: user.encryptedPrivateKey
        });

    } catch (error) {
        console.error("Error fetching cloud wallet:", error);
        return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
    }
}
