
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function testAtlas() {
    console.log('Reading .env.local...');
    const envPath = path.join(process.cwd(), '.env.local');

    let uri = '';
    try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/MONGODB_URI=(.*)/);
        if (match && match[1]) {
            uri = match[1].trim();
        }
    } catch (e) {
        console.error('Could not read .env.local');
        process.exit(1);
    }

    if (!uri) {
        console.error('No MONGODB_URI found in .env.local');
        process.exit(1);
    }

    // Mask password for log
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log('Testing connection to:', maskedUri);

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Atlas Connected Successfully!');

        // List collections to be sure
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('Collections:', collections?.map(c => c.name));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error);
        process.exit(1);
    }
}

testAtlas();
