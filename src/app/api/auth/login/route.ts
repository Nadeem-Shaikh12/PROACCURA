import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();
        const normalizedEmail = email?.toLowerCase().trim();

        if (!normalizedEmail || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await db.findUserByEmail(normalizedEmail);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Role check - strictly enforce role selection on login for tenants/landlords
        // However, allow Admins to login through any role entry point for security anonymity
        if (user.role !== role && user.role !== 'admin') {
            return NextResponse.json({ error: `Account exists but is registered as a ${user.role}` }, { status: 403 });
        }

        // Access Revocation Check
        // Access Revocation Check
        if (user.status === 'removed') {
            return NextResponse.json({
                error: 'Your access has been revoked. Please contact support.',
                isRevoked: true
            }, { status: 403 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check for 2FA requirement
        if (user.securitySettings?.twoFactorEnabled) {
            // Generate a temporary MFA token valid for 5 minutes
            const mfaToken = await new SignJWT({
                userId: user.id,
                purpose: 'mfa_verification'
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('5m')
                .sign(JWT_SECRET);

            // In a real system, we'd send an SMS/Email here.
            // For this demo, we'll simulate sending by logging to console or just using a mock code
            console.log(`[SECURITY] 2FA Code for ${user.email}: 123456`);

            return NextResponse.json({
                mfaRequired: true,
                mfaToken,
                email: user.email
            });
        }

        const token = await new SignJWT({ userId: user.id, role: user.role, name: user.name, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        // Update Login History
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const newLogin = {
            date: new Date().toISOString(),
            device: userAgent,
            ip: ip
        };

        const currentHistory = user.securitySettings?.loginHistory || [];
        const updatedHistory = [newLogin, ...currentHistory].slice(0, 10); // Keep last 10

        const updatedSecuritySettings = {
            ...(user.securitySettings || { twoFactorEnabled: false }),
            lastLogin: new Date().toISOString(),
            loginHistory: updatedHistory
        };

        await db.updateUser(user.id, { securitySettings: updatedSecuritySettings });

        // refresh user object for response
        const userWithHistory = { ...user, securitySettings: updatedSecuritySettings };

        const response = NextResponse.json({ success: true, user: userWithHistory });

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
