import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    try {
        const { code, mfaToken } = await req.json();

        if (!code || !mfaToken) {
            return NextResponse.json({ error: 'Verification code and token required' }, { status: 400 });
        }

        // 1. Verify the MFA Token (temporary challenge token)
        let payload;
        try {
            const result = await jwtVerify(mfaToken, JWT_SECRET);
            payload = result.payload;

            if (payload.purpose !== 'mfa_verification') {
                throw new Error('Invalid token purpose');
            }
        } catch (err) {
            return NextResponse.json({ error: 'MFA session expired or invalid' }, { status: 401 });
        }

        const userId = payload.userId as string;
        const user = await db.findUserById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Validate Code (Mocking 123456 for now)
        if (code !== '123456') {
            return NextResponse.json({ error: 'Incorrect verification code' }, { status: 401 });
        }

        // 3. Success! Issue final long-lived Session Token
        const token = await new SignJWT({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (error: any) {
        console.error('MFA Verification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
