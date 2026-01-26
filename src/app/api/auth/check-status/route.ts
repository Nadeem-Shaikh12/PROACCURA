
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(req: Request) {
    try {
        const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const user = await db.findUserById(userId);

        if (!user) {
            return NextResponse.json({ authenticated: false, reason: 'User not found' }, { status: 404 });
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
