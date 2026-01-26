import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Anyone logged in can read announcements
        const announcements = await db.getAnnouncements();
        return NextResponse.json({ announcements });

    } catch (error) {
        console.error("Announcements GET error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;
        const userId = payload.userId as string;

        if (role !== 'landlord') {
            return NextResponse.json({ error: 'Only landlords can post announcements' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, type } = body;

        const landlord = await db.findUserById(userId);

        const newAnnouncement = await db.addAnnouncement({
            id: uuidv4(),
            title,
            content,
            type,
            date: new Date().toISOString(),
            authorId: userId,
            authorName: landlord?.name || 'Management'
        });

        return NextResponse.json({ success: true, announcement: newAnnouncement });

    } catch (error) {
        console.error("Announcements POST error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
