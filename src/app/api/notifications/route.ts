import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { checkAndTriggerMonthlyNotifications } from '@/lib/notifications';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Proactively check for monthly milestones
        await checkAndTriggerMonthlyNotifications(payload.userId as string, payload.role as 'landlord' | 'tenant');

        const notifications = db.getNotifications(payload.userId as string);
        return NextResponse.json({ notifications });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { id, action } = await req.json();

        if (action === 'markAllRead') {
            db.markAllNotificationsAsRead(payload.userId as string);
            return NextResponse.json({ success: true });
        }

        if (id) {
            db.updateNotification(id, { isRead: true });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
