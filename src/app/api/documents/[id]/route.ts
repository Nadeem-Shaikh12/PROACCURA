import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function DELETE(
    request: Request,
    // Fix: In Next.js 15+, params is a Promise
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        const role = payload.role as string;

        // Await the params promise
        const { id } = await params;

        const doc = await db.getDocumentById(id);

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const isUploader = doc.uploadedBy === userId;

        let canDelete = false;

        if (isUploader) {
            canDelete = true;
        } else if (role === 'landlord' && doc.tenantId) {
            // Landlord can delete if they are the landlord (checked via ownership logic if implemented strict)
            // For now, if role is landlord AND doc says landlordId matches user
            if (doc.landlordId === userId) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        await db.deleteDocument(id);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
