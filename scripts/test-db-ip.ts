
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/tenant-landlord';

async function testConnection() {
    console.log('Testing connection to:', MONGODB_URI);
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('✅ MongoDB Connected Successfully with 127.0.0.1!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed with 127.0.0.1:', error);
        process.exit(1);
    }
}

testConnection();
