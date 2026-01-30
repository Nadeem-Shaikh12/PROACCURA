
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
    console.log("Check-Status API called");
    try {
        const cookieStore = await cookies();
        const tokenValue = cookieStore.get('token')?.value;

        if (!tokenValue) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const { payload } = await jwtVerify(tokenValue, JWT_SECRET);
        const userId = payload.userId as string;

        const user = await db.findUserById(userId);

        if (!user) {
            // User not found in DB but has valid token -> Likely ephemeral DB reset.
            // Allow them to proceed so /api/auth/me can restore the session.
            console.log(`[Auth] User ${userId} missing from DB but has valid token. Allowing session recovery.`);
            return NextResponse.json({
                authenticated: true,
                status: 'active', // Assume active to allow recovery
                revoked: false
            });
        }

        if (user.status === 'removed') {
            return NextResponse.json({
                authenticated: true,
                status: user.status,
                revoked: true
            }, { status: 403 });
        }

        return NextResponse.json({
            authenticated: true,
            status: user.status || 'active',
            revoked: false
        });

    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
