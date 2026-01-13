import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'landlord') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const landlordId = payload.userId as string;
        const { content } = await req.json();

        if (!content) return NextResponse.json({ error: 'Message content is required' }, { status: 400 });

        const tenants = await db.getLandlordTenants(landlordId);
        const messages = tenants.map(t => ({
            id: nanoid(),
            senderId: landlordId,
            receiverId: t.tenantId,
            content,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text' as const
        }));

        // In a real DB we might do a bulk insert. Here we loop.
        for (const m of messages) {
            await db.addMessage(m);
        }

        return NextResponse.json({ success: true, count: messages.length });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
