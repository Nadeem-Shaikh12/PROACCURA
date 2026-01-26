import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'landlord' or 'tenant'

    if (!userId || !role) {
        return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    try {
        let documents;
        if (role === 'landlord') {
            documents = await db.getDocumentsByLandlord(userId);
        } else {
            documents = await db.getDocumentsByTenant(userId);
        }
        return NextResponse.json({ documents });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);

        const body = await req.json();
        const { tenantId, landlordId, category, name, url, description, tags, expiryDate, size, mimeType } = body;

        // Auto-fill landlordId if creator is landlord
        const finalLandlordId = payload.role === 'landlord' ? payload.userId as string : landlordId;
        const finalTenantId = payload.role === 'tenant' ? payload.userId as string : tenantId;

        if (!finalTenantId || !finalLandlordId || !category || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newDoc = await db.addDocument({
            id: crypto.randomUUID(),
            tenantId: finalTenantId,
            landlordId: finalLandlordId,
            category,
            name,
            url: url || '#', // Mock URL
            version: 1,
            createdAt: new Date().toISOString(),
            expiryDate,
            size,
            mimeType,
            uploadedBy: payload.userId as string
        });

        // Notify the other party
        const notifyTargetId = payload.role === 'landlord' ? finalTenantId : finalLandlordId;
        const notifyTargetRole = payload.role === 'landlord' ? 'tenant' : 'landlord';

        await sendNotification(
            notifyTargetId,
            notifyTargetRole,
            'DOCUMENT_SHARED',
            'New Document Added',
            `${payload.role === 'landlord' ? 'Landlord' : 'Tenant'} added a new document: ${name}`
        );

        return NextResponse.json({ success: true, document: newDoc });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
