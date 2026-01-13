
import mongoose from 'mongoose';
// Removed dotenv to avoid dependency issues
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tenant-landlord';

async function testConnection() {
    console.log('Testing connection to:', MONGODB_URI);
    try {
        await mongoose.connect(MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected Successfully!');

        // Try to list collections
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('Collections:', collections?.map(c => c.name));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error);
        process.exit(1);
    }
}

testConnection();
