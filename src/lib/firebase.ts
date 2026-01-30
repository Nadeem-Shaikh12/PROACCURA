
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// We check if apps.length is 0 to prevent re-initialization during hot reloads
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('🔥 Firebase Admin Initialized Successfully');
    } catch (error: any) {
        console.error('❌ Firebase Admin Initialization Error:', error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
