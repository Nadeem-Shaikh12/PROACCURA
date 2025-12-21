import { NextResponse } from 'next/server';
import { MOCK_LEASES } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const { leaseId, role } = await request.json();

        const lease = MOCK_LEASES.find(l => l.id === leaseId);
        if (!lease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        if (role === 'tenant') {
            lease.signedByTenant = true;
        } else {
            lease.signedByLandlord = true;
        }

        if (lease.signedByLandlord && lease.signedByTenant) {
            lease.status = 'ACTIVE';
        }

        return NextResponse.json({ success: true, lease });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to sign' }, { status: 500 });
    }
}
