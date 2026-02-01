import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    console.log('[API] Tenant Verify POST Request Received');
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

        const payloadData = await req.json();
        console.log('[API POST] Tenant Verify Payload:', payloadData);
        const { propertyId, fullName, mobile, idProofType, idProofNumber, city, paymentStatus, paymentAmount, transactionId } = payloadData;

        // Check for existing pending request
        const existingRequest = await db.findRequestByTenantId(payload.userId as string);
        if (existingRequest && existingRequest.status === 'pending') {
            return NextResponse.json({ error: 'Verification process is already pending. Landlord will connect with you.' }, { status: 409 });
        }

        if (!propertyId || !fullName || !mobile || !idProofType || !idProofNumber || !city) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const property = await db.findPropertyById(propertyId);
        if (!property) {
            return NextResponse.json({ error: 'Invalid Property ID' }, { status: 404 });
        }

        const newRequest = await db.addRequest({
            id: uuidv4(),
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
    } catch (error: any) {
        console.error('[API POST] Tenant Verify Error:', error);

        let errorMessage = 'Internal Server Error';
        let details = error instanceof Error ? error.message : String(error);

        // Check for Firebase initialization failure (common in Vercel if env vars missing)
        if (details.includes('collection is not a function') || details.includes('firestore.collection is not a function')) {
            errorMessage = 'Server Configuration Error: Firebase credentials missing or invalid.';
            console.error('CRITICAL: Firebase Admin not initialized. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Vercel Settings.');
        }

        return NextResponse.json({
            error: errorMessage,
            details: details
        }, { status: 500 });
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

        const request = await db.findRequestByTenantId(payload.userId as string);
        console.log(`[API GET] Tenant Verify Check for ${payload.userId}:`, request);

        let landlordName = '';
        if (request) {
            const landlord = await db.findUserById(request.landlordId);
            landlordName = landlord ? landlord.name : 'Unknown Landlord';
        }

        return NextResponse.json({ request: request ? { ...request, landlordName } : null });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
