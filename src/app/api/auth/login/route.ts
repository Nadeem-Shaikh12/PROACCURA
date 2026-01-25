import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await db.findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Role check - strictly enforce role selection on login to prevent confusion
        if (user.role !== role) {
            return NextResponse.json({ error: `Account exists but is registered as a ${user.role}` }, { status: 403 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
