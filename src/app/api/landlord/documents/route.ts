import { NextResponse } from 'next/server';
import { MOCK_LEASES, Lease } from '@/lib/store';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlordId');

    // In a real app, verify session.
    // Filter by landlord
    const leases = MOCK_LEASES.filter(l => l.landlordId === (landlordId || 'landlord-1'));

    return NextResponse.json({ leases });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newLease: Lease = {
            id: `lease-${Date.now()}`,
            ...body,
            status: 'PENDING_SIGNATURE',
            signedByLandlord: true, // Landlord creates it, effectively signing
            signedByTenant: false,
            documentUrl: '/mock-lease.pdf'
        };

        // In memory add (won't persist across rebuilds but good for session)
        MOCK_LEASES.push(newLease);

        return NextResponse.json({ success: true, lease: newLease });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 });
    }
}
