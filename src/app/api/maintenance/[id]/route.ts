import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function PUT(
    request: Request,
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

        const { id } = await params;
        const body = await request.json();

        const existing = await db.getMaintenanceRequestById(id);
        if (!existing) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Check ownership
        if (existing.tenantId !== userId && existing.landlordId !== userId) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const updated = await db.updateMaintenanceRequest(id, body);

        return NextResponse.json({ success: true, request: updated });

    } catch (error) {
        console.error("Maintenance PUT error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        const { id } = await params;

        const requestData = await db.getMaintenanceRequestById(id);
        if (!requestData) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (requestData.tenantId !== userId && requestData.landlordId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ request: requestData });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
