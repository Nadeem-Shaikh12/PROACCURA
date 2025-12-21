import { NextResponse } from 'next/server';
import { MOCK_PAYMENTS, PaymentRecord } from '@/lib/store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // Could filter by billId or tenantId if needed

    return NextResponse.json({ payments: MOCK_PAYMENTS });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newPayment: PaymentRecord = {
            id: `pay-${Date.now()}`,
            paidAt: new Date().toISOString(),
            method: 'ONLINE',
            transactionId: `tx_${Math.random().toString(36).substr(2, 9)}`,
            ...body
        };
        MOCK_PAYMENTS.push(newPayment);
        return NextResponse.json({ success: true, payment: newPayment });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
}
