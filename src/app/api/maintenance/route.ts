import { NextResponse } from 'next/server';
import { MOCK_MAINTENANCE_REQUESTS, MaintenanceRequest } from '@/lib/store';
import { db } from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlordId');
    const tenantId = searchParams.get('tenantId');

    let requests = MOCK_MAINTENANCE_REQUESTS;

    if (landlordId) {
        requests = requests.filter(r => r.landlordId === landlordId);
    } else if (tenantId) {
        requests = requests.filter(r => r.tenantId === tenantId);
    }

    return NextResponse.json({ requests });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newRequest: MaintenanceRequest = {
            id: `maint-${crypto.randomUUID().slice(0, 8)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'OPEN',
            images: [], // Mock images or handle upload separately
            ...body
        };

        MOCK_MAINTENANCE_REQUESTS.push(newRequest);

        // Notify Landlord
        await sendNotification(
            newRequest.landlordId,
            'landlord',
            'MAINTENANCE_LOGGED',
            'New Maintenance Request',
            `${newRequest.tenantName} reported: ${newRequest.title}`
        );

        return NextResponse.json({ success: true, request: newRequest });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        const reqIndex = MOCK_MAINTENANCE_REQUESTS.findIndex(r => r.id === id);

        if (reqIndex === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        MOCK_MAINTENANCE_REQUESTS[reqIndex].status = status;
        MOCK_MAINTENANCE_REQUESTS[reqIndex].updatedAt = new Date().toISOString();

        const req = MOCK_MAINTENANCE_REQUESTS[reqIndex];

        // Notify Tenant
        await sendNotification(
            req.tenantId,
            'tenant',
            'MAINTENANCE_UPDATE',
            'Maintenance Update',
            `Your request "${req.title}" is now ${status}.`
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
