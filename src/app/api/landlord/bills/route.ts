import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// nanoid removed

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'landlord') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const bills = db.getBillsByLandlord(payload.userId as string);

        // Enrich with tenant name
        const billsWithNames = bills.map(bill => {
            const tenant = db.getTenantStay(bill.tenantId);
            // We need to fetch user details to get name, but getTenantStay returns stay object
            // Let's iterate users just for this (inefficient but works for file DB)
            // Actually, let's just use getLandlordTenants to cross-reference
            // Or better, db.ts should allow finding user by ID.
            // For now, let's return raw bill, UI can fetch tenant list to map names.
            return bill;
        });

        return NextResponse.json({ bills: billsWithNames });
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
        if (payload.role !== 'landlord') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const { tenantId, stayId, amount, type, dueDate, month } = body;

        const newBill = db.addBill({
            id: crypto.randomUUID(),
            landlordId: payload.userId as string,
            tenantId,
            stayId,
            amount: Number(amount),
            type,
            month,
            dueDate,
            status: 'PENDING'
        });

        // Notify Tenant
        db.addNotification({
            id: crypto.randomUUID(),
            userId: tenantId,
            role: 'tenant',
            title: 'New Bill Received',
            message: `You have a new bill for ${type} ($${amount}) due on ${new Date(dueDate).toLocaleDateString()}.`,
            type: 'NEW_BILL_CYCLE',
            isRead: false,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, bill: newBill });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'landlord') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const billId = searchParams.get('id');

        if (!billId) return NextResponse.json({ error: 'Missing bill ID' }, { status: 400 });

        // Basic security check: find the bill first to ensure it belongs to this landlord
        const landlordBills = db.getBillsByLandlord(payload.userId as string);
        const billToDelete = landlordBills.find(b => b.id === billId);

        if (!billToDelete) {
            return NextResponse.json({ error: 'Bill not found or unauthorized' }, { status: 404 });
        }

        const success = db.deleteBill(billId);

        if (success) {
            return NextResponse.json({ success: true, message: 'Bill removed successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
