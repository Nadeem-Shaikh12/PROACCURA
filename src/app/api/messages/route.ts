import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sendNotification } from '@/lib/notifications';

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
        await db.markMessagesAsRead(chatWith, payload.userId as string);

        const messages = await db.getMessages(payload.userId as string, chatWith);
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

        const newMessage = await db.addMessage({
            id: crypto.randomUUID(),
            senderId: payload.userId as string,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
            isRead: false,
            type
        });

        // Create a notification for the receiver
        await sendNotification(
            receiverId,
            payload.role === 'landlord' ? 'tenant' : 'landlord',
            'NEW_MESSAGE',
            'New Message',
            `You received a new message from ${payload.name}`
        );

        return NextResponse.json({ message: newMessage });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
