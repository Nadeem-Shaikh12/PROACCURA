import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Both Tenant and Landlord can potentially access history, but the query differs
        // For this route, we focus on the logged-in user finding THEIR OWN history as a tenant.
        // Or if a landlord wants to see a tenant's history, they might use a different param.
        // User Request says: "GET /tenant/history -> returns only his records"

        if (payload.role === 'tenant') {
            const history = await db.getTenantHistory(payload.userId as string);
            return NextResponse.json({ history });
        } else {
            // Landlord can view history of any tenant provided they specify tenantId
            const { searchParams } = new URL(req.url || '', 'http://n');
            const tenantId = searchParams.get('tenantId');

            if (!tenantId) {
                return NextResponse.json({ error: 'Tenant ID required for landlords' }, { status: 400 });
            }

            const history = await db.getTenantHistory(tenantId);
            return NextResponse.json({ history });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
