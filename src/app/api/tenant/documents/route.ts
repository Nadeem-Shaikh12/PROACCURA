import { NextResponse } from 'next/server';
import { MOCK_LEASES, Lease } from '@/lib/store';

export async function GET(request: Request) {
    // In real app, get tenant from session
    // For now, return all leases for tenant-1
    const leases = MOCK_LEASES.filter(l => l.tenantId === 'tenant-1');

    return NextResponse.json({ leases });
}
