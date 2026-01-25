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

        const user = await db.findUserById(payload.userId as string);
        const prefs = user?.notificationPreferences || {
            rentReminders: true,
            maintenanceUpdates: true,
            leaseRenewal: true,
            messages: true,
            documents: true
        };

        const notifications = await db.getNotifications(payload.userId as string);

        // Soft-filter based on preferences
        const filteredNotifications = notifications.filter((n: any) => {
            if (n.type === 'RENT_DUE' || n.type === 'PAYMENT_RECEIVED') return prefs.rentReminders;
            if (n.type === 'MAINTENANCE_LOGGED' || n.type === 'MAINTENANCE_UPDATE' || n.type === 'MAINTENANCE_UPDATED') return prefs.maintenanceUpdates;
            if (n.type === 'LEASE_RENEWAL') return prefs.leaseRenewal;
            if (n.type === 'NEW_MESSAGE') return prefs.messages;
            if (n.type === 'DOCUMENT_SHARED') return prefs.documents;
            return true; // Default keep if type unknown or generic
        });

        return NextResponse.json({ notifications: filteredNotifications });
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
            await db.markAllNotificationsAsRead(payload.userId as string);
            return NextResponse.json({ success: true });
        }

        if (id) {
            await db.updateNotification(id, { isRead: true });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
