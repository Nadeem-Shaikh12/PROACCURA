import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

// GET: Fetch conversation history
export async function GET(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { searchParams } = new URL(request.url);
        const chatWith = searchParams.get('chatWith');

        if (!chatWith) {
            return NextResponse.json({ error: 'Missing chatWith parameter' }, { status: 400 });
        }

        // Mark messages as read when fetching
        db.markMessagesAsRead(chatWith, payload.userId as string);

        const messages = db.getMessages(payload.userId as string, chatWith);
        return NextResponse.json({ messages });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const body = await request.json();
        const { receiverId, content, type = 'text' } = body;

        if (!receiverId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMessage = db.addMessage({
            id: crypto.randomUUID(),
            senderId: payload.userId as string,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
            isRead: false,
            type
        });

        // Create a notification for the receiver
        db.addNotification({
            id: crypto.randomUUID(),
            userId: receiverId,
            type: 'REMARK_ADDED', // Valid type for general alerts
            title: 'New Message',
            message: `You received a new message from ${payload.name}`,
            role: payload.role === 'landlord' ? 'tenant' : 'landlord', // Receiver's role
            createdAt: new Date().toISOString(),
            isRead: false
        });

        return NextResponse.json({ message: newMessage });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
