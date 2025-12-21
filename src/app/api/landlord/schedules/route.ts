import { NextResponse } from 'next/server';
import { MOCK_SCHEDULES, PaymentSchedule } from '@/lib/store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlordId');

    const schedules = MOCK_SCHEDULES.filter(s => s.landlordId === landlordId);
    return NextResponse.json({ schedules });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newSchedule: PaymentSchedule = {
            id: `sched-${Date.now()}`,
            isActive: true,
            ...body
        };
        MOCK_SCHEDULES.push(newSchedule);
        return NextResponse.json({ success: true, schedule: newSchedule });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }
}
