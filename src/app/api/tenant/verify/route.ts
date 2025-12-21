import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'tenant') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { propertyId, fullName, mobile, idProofType, idProofNumber, city, paymentStatus, paymentAmount, transactionId } = await req.json();

        // Check for existing pending request
        const existingRequest = db.findRequestByTenantId(payload.userId as string);
        if (existingRequest && existingRequest.status === 'pending') {
            return NextResponse.json({ error: 'Verification process is already pending. Landlord will connect with you.' }, { status: 409 });
        }

        if (!propertyId || !fullName || !mobile || !idProofType || !idProofNumber || !city) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const property = db.findPropertyById(propertyId);
        if (!property) {
            return NextResponse.json({ error: 'Invalid Property ID' }, { status: 404 });
        }

        const newRequest = db.addRequest({
            id: crypto.randomUUID(),
            tenantId: payload.userId as string,
            fullName,
            mobile,
            idProofType,
            idProofNumber,
            city,
            landlordId: property.landlordId,
            propertyId: property.id,
            status: 'pending',
            paymentStatus: paymentStatus || 'pending',
            paymentAmount: paymentAmount,
            transactionId: transactionId,
            submittedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role !== 'tenant') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const request = db.findRequestByTenantId(payload.userId as string);
        console.log(`[API GET] Tenant Verify Check for ${payload.userId}:`, request);

        let landlordName = '';
        if (request) {
            const landlord = db.findUserById(request.landlordId);
            landlordName = landlord ? landlord.name : 'Unknown Landlord';
        }

        return NextResponse.json({ request: request ? { ...request, landlordName } : null });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
