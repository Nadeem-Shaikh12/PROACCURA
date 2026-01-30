
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// We check if apps.length is 0 to prevent re-initialization during hot reloads
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('🔥 Firebase Admin Initialized Successfully');
        } else {
            // Warn but don't crash - allows build to proceed without secrets
            console.warn('⚠️ Firebase credentials missing. Skipping initialization (acceptable for build time).');
            console.warn('Missing vars:', {
                projectId: !!process.env.FIREBASE_PROJECT_ID,
                email: !!process.env.FIREBASE_CLIENT_EMAIL,
                key: !!process.env.FIREBASE_PRIVATE_KEY
            });
        }
    } catch (error: any) {
        console.error('❌ Firebase Admin Initialization Error:', error.message);
    }
}

// Export safe instances. If init was skipped, these might throw on usage, but import will succeed.
// In a build environment (no secrets), we prioritize import success.
const db = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
const auth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;

export { db, auth };

