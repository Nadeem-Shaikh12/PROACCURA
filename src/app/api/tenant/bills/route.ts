import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { sendNotification } from '@/lib/notifications';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'tenant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const bills = await db.getBillsByTenant(payload.userId as string);
        console.log(`[API] Fetching bills for tenant: ${payload.userId}. Found: ${bills.length}`);
        return NextResponse.json({ bills });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'tenant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const { billId } = body;

        const paidBill = await db.payBill(billId);

        if (paidBill) {
            // Log Payment in History
            await db.addHistory({
                id: nanoid(),
                tenantId: payload.userId as string,
                type: 'PAYMENT',
                description: `Paid ${paidBill.type} bill of ${paidBill.amount}`,
                amount: paidBill.amount,
                date: new Date().toISOString(),
                createdBy: payload.userId as string
            });

            // Notify Landlord
            await sendNotification(
                paidBill.landlordId,
                'landlord',
                'PAYMENT_RECEIVED',
                'Payment Received',
                `Tenant has paid ${paidBill.type} bill of $${paidBill.amount}.`
            );

            return NextResponse.json({ success: true, bill: paidBill });
        } else {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
