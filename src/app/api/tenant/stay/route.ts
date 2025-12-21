import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'tenant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const stay = db.getTenantStay(payload.userId as string);

        if (!stay) {
            return NextResponse.json({ stay: null });
        }

        // Hydrate with property details
        const property = db.findPropertyById(stay.propertyId);
        const landlord = property ? db.findUserById(property.landlordId) : null;

        // Hydrate with Trust Score
        // We need to import the new utility dynamically or add logic here
        // Ideally, we import. Let's assume TS compilation works.
        const { calculateTrustScore } = await import('@/lib/score'); // Dynamic import to avoid cycles/issues
        const history = db.getTenantHistory(payload.userId as string);
        const trustScore = calculateTrustScore(history);

        return NextResponse.json({
            stay: {
                ...stay,
                propertyName: property?.name || 'Unknown Property',
                propertyAddress: property?.address,
                monthlyRent: property?.monthlyRent,
                landlordId: property?.landlordId,
                landlordName: landlord?.name,
                landlordEmail: landlord?.email,
                trustScore // Include in response
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
