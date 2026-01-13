import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
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

        const landlordId = payload.userId as string;

        // We need to get all requests for this landlord
        // Adding getRequestsByLandlord to db.ts
        // Or filter manually if getRequests returns all (it does)

        // Assuming db.getRequests() returns all requests
        const allRequests = await db.getRequests();
        const requests = allRequests.filter(r => r.landlordId === landlordId && r.status === 'pending');

        // Enhance with property name if possible
        const enhancedRequests = await Promise.all(requests.map(async (req) => {
            const property = req.propertyId ? await db.findPropertyById(req.propertyId) : null;
            return {
                ...req,
                propertyName: property ? property.name : 'Unknown Property'
            };
        }));

        return NextResponse.json({ requests: enhancedRequests });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
