import mongoose from 'mongoose';
import fs from 'fs';

async function checkDB() {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    const uriLine = envContent.split('\n').find(line => line.includes('MONGODB_URI'));
    const uri = uriLine.split('=')[1].replace(/\r/g, '').trim();

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const users = await mongoose.connection.db.collection('users').find().toArray();

    console.log(`\nFound ${users.length} users in the database.`);

    if (users.length > 0) {
        console.log("\nSample User Record (Redacted private keys):");
        const sample = users[0];
        console.log({
            _id: sample._id,
            clerkId: sample.clerkId,
            walletAddress: sample.walletAddress,
            hasEncryptedKey: !!sample.encryptedPrivateKey,
            createdAt: sample.createdAt
        });
    }

    process.exit(0);
}

checkDB().catch(console.error);
