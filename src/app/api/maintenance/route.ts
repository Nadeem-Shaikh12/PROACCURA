import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { MaintenanceRequest } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        const role = payload.role as string;

        if (role === 'tenant') {
            const requests = await db.getMaintenanceRequestsByTenant(userId);
            return NextResponse.json({ requests });
        } else if (role === 'landlord') {
            const requests = await db.getMaintenanceRequestsByLandlord(userId);
            return NextResponse.json({ requests });
        }

        return NextResponse.json({ requests: [] });

    } catch (error) {
        console.error("Maintenance GET error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        const role = payload.role as string;

        if (role !== 'tenant') {
            return NextResponse.json({ error: 'Only tenants can create maintenance requests' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, category, priority, images } = body;

        // Get tenant info to populate request
        const tenant = await db.findUserById(userId);
        const stay = await db.getTenantStay(userId);

        if (!stay) {
            return NextResponse.json({ error: 'No active stay found. You cannot create maintenance requests.' }, { status: 400 });
        }

        const property = await db.findPropertyById(stay.propertyId);

        const newRequest: MaintenanceRequest = {
            id: uuidv4(),
            tenantId: userId,
            tenantName: tenant?.name || 'Unknown',
            landlordId: stay.landlordId,
            propertyName: property?.name || 'Unknown Property',
            title,
            description,
            category,
            priority,
            status: 'OPEN',
            images: images || [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const created = await db.addMaintenanceRequest(newRequest);

        // Notify Landlord
        await db.addNotification({
            id: uuidv4(),
            userId: stay.landlordId,
            role: 'landlord',
            title: 'New Maintenance Request',
            message: `${tenant?.name} reported: ${title}`,
            type: 'MAINTENANCE_UPDATE',
            isRead: false,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, request: created });

    } catch (error) {
        console.error("Maintenance POST error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
