import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (payload.role !== 'landlord') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { tenantId, type, description, amount, date, month, year, units, status } = await req.json();

        if (!tenantId || !type || !description || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify the landlord "owns" this tenant
        const request = await db.findRequestByTenantId(tenantId);
        if (!request || request.landlordId !== payload.userId) {
            return NextResponse.json({ error: 'Unauthorized to modify this tenant' }, { status: 403 });
        }

        const newRecord = await db.addHistory({
            id: nanoid(),
            tenantId,
            type,
            description,
            amount: amount ? Number(amount) : undefined,
            month,
            year,
            units: units ? Number(units) : undefined,
            status,
            date,
            createdBy: payload.userId as string
        });

        // Trigger Notification for Tenant
        if (type === 'LIGHT_BILL' || type === 'REMARK' || type === 'RENT_PAYMENT') {
            let title = 'New Record Added';
            let message = `Your landlord added a new ${type.toLowerCase().replace('_', ' ')} record.`;
            let notifyType: any = 'REMARK_ADDED';

            if (type === 'LIGHT_BILL') {
                title = 'New Utility Bill';
                message = `A new electricity bill for ${month} ${year} has been posted. Status: ${status || 'pending'}.`;
                notifyType = status === 'pending' ? 'PAYMENT_PENDING' : 'PAYMENT_RECEIVED';
            } else if (type === 'RENT_PAYMENT') {
                title = 'Rent Payment Updated';
                message = `Your rent payment for ${month || 'the period'} has been marked as ${status || 'received'}.`;
                notifyType = 'PAYMENT_RECEIVED';
            }

            await db.addNotification({
                id: nanoid(),
                userId: tenantId,
                role: 'tenant',
                title,
                message,
                type: notifyType,
                isRead: false,
                createdAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, record: newRecord });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
