import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const stayId = searchParams.get('stayId');

    if (!stayId) return NextResponse.json({ error: 'Stay ID required' }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'landlord') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Update stay status
        const stays = await db.getLandlordTenants(payload.userId as string);
        const stay = stays.find(s => s.id === stayId);

        if (!stay) return NextResponse.json({ error: 'Stay not found' }, { status: 404 });

        // End the stay in DB
        // End the stay in DB
        await db.endTenantStay(stay.tenantId);

        // Revoke Access
        await db.updateUser(stay.tenantId, { status: 'removed' });

        // Notify tenant
        await db.addNotification({
            id: Math.random().toString(36).substr(2, 9),
            userId: stay.tenantId,
            role: 'tenant',
            title: 'Stay Terminated',
            message: 'Your stay has been finalized by the landlord. Thank you for using our platform.',
            type: 'REMARK_ADDED',
            isRead: false,
            createdAt: new Date().toISOString()
        });

        // Add to history
        await db.addHistory({
            id: Math.random().toString(36).substr(2, 9),
            tenantId: stay.tenantId,
            type: 'MOVE_OUT',
            description: `Resident moved out from ${stay.propertyName}. Stay finalized.`,
            date: new Date().toISOString(),
            createdBy: payload.userId as string
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
