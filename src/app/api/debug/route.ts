
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { db as firestore } from '@/lib/firebase';

export async function GET() {
    const isProduction = process.env.NODE_ENV === 'production';

    try {
        const dbStatus = await db.getDebugStatus();

        return NextResponse.json({
            status: 'ok',
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                isProduction,
                hasFirebaseCreds: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL)
            },
            database: {
                adapterMode: dbStatus.usingFirebase ? 'Firebase Firestore' : 'JSON (Memory/File)', // Updated key check
                firestoreInitialized: !!firestore,
                dbPath: dbStatus.dbPath
            },
            timestamp: new Date().toISOString()
        });
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            error: e.message || String(e),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                isProduction
            },
            timestamp: new Date().toISOString()
        }, { status: 200 });
    }
}
