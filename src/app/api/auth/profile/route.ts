import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function PUT(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { mobile, city, state, aadhaarNumber } = await req.json();

        const updatedUser = db.updateUser(payload.userId as string, {
            tenantProfile: {
                mobile,
                city,
                state,
                aadhaarNumber,
                isProfileComplete: true,
                paymentStatus: 'PENDING'
            }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
