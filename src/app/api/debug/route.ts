
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { db } from '@/lib/db';

export async function GET() {
    // Force init
    const dbStatus = await db.getDebugStatus();

    const mongoUri = process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

    return NextResponse.json({
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            isProduction,
            hasMongoUri: !!mongoUri,
            // Masking URI for security but showing protocol/host
            mongoUriPreview: mongoUri ? `${mongoUri.substring(0, 15)}...${mongoUri.substring(mongoUri.lastIndexOf('@'))}` : 'NOT_SET'
        },
        database: {
            adapterMode: dbStatus.usingMongo ? 'MongoDB' : 'JSON (Memory/File)',
            mongooseState: states[connectionState] || 'Unknown',
            mongooseHost: mongoose.connection.host
        },
        timestamp: new Date().toISOString()
    });
}
