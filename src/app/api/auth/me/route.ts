import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        let user = await db.findUserById(userId);

        // If user is missing (due to server restart wiping memory), but token is valid:
        // Automatically RE-CREATE the user from the token details to keep them logged in.
        if (!user && payload.email) {
            console.log("Restoring user session from token:", userId);
            user = await db.addUser({
                id: userId,
                name: payload.name as string,
                email: payload.email as string,
                role: payload.role as 'landlord' | 'tenant',
                passwordHash: 'restored_session_placeholder', // Dummy hash, won't allow pw login until reset but keeps session alive
            });
        }

        if (!user) {
            const response = NextResponse.json({ user: null });
            response.cookies.delete('token');
            return response;
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantProfile: user.tenantProfile,
                securitySettings: user.securitySettings
            }
        });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}
