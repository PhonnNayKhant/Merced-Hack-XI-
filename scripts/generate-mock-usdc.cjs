const {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

const ADMIN_KEYPAIR_PATH = path.join(__dirname, "../.admin-keypair.json");
const MINT_KEYPAIR_PATH = path.join(__dirname, "../.mock-usdc-mint.json");

function loadKeypair(filepath) {
    if (fs.existsSync(filepath)) {
        const secretKeyString = fs.readFileSync(filepath, { encoding: "utf8" });
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return Keypair.fromSecretKey(secretKey);
    }
    return null;
}

function saveKeypair(keypair, filepath) {
    fs.writeFileSync(
        filepath,
        JSON.stringify(Array.from(keypair.secretKey))
    );
}

async function main() {
    const args = process.argv.slice(2);
    const recipientAddress = args[0];

    if (!recipientAddress) {
        console.error("❌ Error: Please provide a recipient wallet address.");
        console.error("👉 Usage: node scripts/generate-mock-usdc.cjs <your_wallet_address>");
        process.exit(1);
    }

    let recipientPubkey;
    try {
        recipientPubkey = new PublicKey(recipientAddress);
    } catch (e) {
        console.error("❌ Error: Invalid recipient address format.");
        process.exit(1);
    }

    console.log("🔌 Connecting to Devnet...");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Load or create Admin Keypair
    let payer = loadKeypair(ADMIN_KEYPAIR_PATH);
    if (!payer) {
        console.log("🔑 Creating new admin keypair...");
        payer = Keypair.generate();
        saveKeypair(payer, ADMIN_KEYPAIR_PATH);
    }
    console.log(`👤 Admin Address: ${payer.publicKey.toBase58()}`);

    // Check admin SOL balance
    let balance = await connection.getBalance(payer.publicKey);
    console.log(`💰 Admin SOL Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.2 * LAMPORTS_PER_SOL) {
        console.log("⏳ Admin SOL is low, requesting 1 SOL airdrop...");
        try {
            const sig = await connection.requestAirdrop(payer.publicKey, 1 * LAMPORTS_PER_SOL);
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: sig
            });
            balance = await connection.getBalance(payer.publicKey);
            console.log(`✅ Airdrop successful. New balance: ${balance / LAMPORTS_PER_SOL} SOL`);
        } catch (e) {
            console.error("❌ Airdrop failed. You might be rate limited.");
            console.error(e.message);
            console.log("👉 Please go to https://faucet.solana.com/ and paste the Admin Address to get Devnet SOL.");
            process.exit(1);
        }
    }

    // Load or create Mint Keypair
    let mintKeypair = loadKeypair(MINT_KEYPAIR_PATH);
    let mintAddress;
    if (!mintKeypair) {
        console.log("🪙 Creating new Mock USDC Mint...");
        mintKeypair = Keypair.generate();
        saveKeypair(mintKeypair, MINT_KEYPAIR_PATH);

        // We recreate it on chain
        mintAddress = await createMint(
            connection,
            payer, // payer
            payer.publicKey, // mintAuthority
            payer.publicKey, // freezeAuthority
            6, // decimals for USDC
            mintKeypair // keypair for the mint address
        );
        console.log(`✨ Created new Mock USDC Mint: ${mintAddress.toBase58()}`);
        console.log(`\n⚠️ IMPORTANT: You MUST update lib/solana.js!`);
        console.log(`Change USDC_MINT_DEVNET to: "${mintAddress.toBase58()}"\n`);
    } else {
        mintAddress = mintKeypair.publicKey;
        console.log(`📌 Using existing Mock USDC Mint: ${mintAddress.toBase58()}`);
    }

    console.log(`🏦 Getting/Creating associated token account for recipient...`);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintAddress,
        recipientPubkey
    );
    console.log(`✅ Token account: ${tokenAccount.address.toBase58()}`);

    const amountToMintUI = 1000;
    const amountToMint = amountToMintUI * 1_000_000; // 6 decimals
    console.log(`💸 Minting ${amountToMintUI} Mock USDC to ${recipientAddress} ...`);

    const txSig = await mintTo(
        connection,
        payer,
        mintAddress,
        tokenAccount.address,
        payer.publicKey,
        amountToMint,
        []
    );

    console.log(`\n🎉 Success! Minted ${amountToMintUI} Mock USDC.`);
    console.log(`🔗 Transaction log: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

    if (loadKeypair(MINT_KEYPAIR_PATH)) {
        console.log(`\n======================================================`);
        console.log(`🛑  Make sure in lib/solana.js you have this set:`);
        console.log(`const USDC_MINT_DEVNET = new PublicKey("${mintAddress.toBase58()}");`);
        console.log(`======================================================`);
    }
}

main().catch((err) => {
    console.error("❌ Script failed:");
    console.error(err);
});
