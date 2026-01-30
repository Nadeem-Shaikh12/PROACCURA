
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { db } from '@/lib/db';

export async function GET() {
    const mongoUri = process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production';

    try {
        // Force init which might throw in production
        const dbStatus = await db.getDebugStatus();

        const connectionState = mongoose.connection.readyState;
        const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

        return NextResponse.json({
            status: 'ok',
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                isProduction,
                hasMongoUri: !!mongoUri,
                mongoUriPreview: mongoUri ? `${mongoUri.substring(0, 15)}...${mongoUri.substring(mongoUri.lastIndexOf('@'))}` : 'NOT_SET'
            },
            database: {
                adapterMode: dbStatus.usingMongo ? 'MongoDB' : 'JSON (Memory/File)',
                mongooseState: states[connectionState] || 'Unknown',
                mongooseHost: mongoose.connection.host
            },
            timestamp: new Date().toISOString()
        });
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            error: e.message || String(e),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                isProduction,
                hasMongoUri: !!mongoUri,
                mongoUriPreview: mongoUri ? `${mongoUri.substring(0, 15)}...${mongoUri.substring(mongoUri.lastIndexOf('@'))}` : 'NOT_SET'
            },
            timestamp: new Date().toISOString()
        }, { status: 200 }); // Return 200 so we can see the JSON in browser
    }
}
