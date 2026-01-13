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
        if (payload.role !== 'landlord') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { id, status, remarks, ...extraData } = body;

        // Security: Fetch request first to check ownership
        const allRequests = await db.getRequests();
        const existingRequest = allRequests.find(r => r.id === id);

        if (!existingRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // Security Guard
        if (existingRequest.landlordId !== payload.userId) {
            return NextResponse.json({ error: 'Unauthorized: You do not own this request' }, { status: 403 });
        }

        // Update request status
        const updatedRequest = await db.updateRequestStatus(id, status, remarks, extraData);

        if (!updatedRequest) {
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }

        // Logic for history and notifications
        if (status === 'approved') {
            // STRICT RULE: Check if tenant already has an ACTIVE stay
            const existingStay = await db.getTenantStay(updatedRequest.tenantId);
            if (existingStay) {
                return NextResponse.json({ error: 'Tenant already has an active tenancy. They must move out first.' }, { status: 400 });
            }

            await db.addHistory({
                id: crypto.randomUUID(),
                tenantId: updatedRequest.tenantId,
                type: 'JOINED',
                description: `Tenant verified and joined the property.`,
                date: extraData.joiningDate || new Date().toISOString(),
                createdBy: payload.userId as string
            });

            // MAGIC MOMENT: Establish the TenantStay connection
            await db.addTenantStay({
                id: crypto.randomUUID(),
                tenantId: updatedRequest.tenantId,
                landlordId: payload.userId as string,
                propertyId: existingRequest.propertyId || '', // Should exist
                joinDate: extraData.joiningDate || new Date().toISOString(),
                status: 'ACTIVE'
            });

            // UPDATE PROPERTY OCCUPANCY
            if (existingRequest.propertyId) {
                const property = await db.findPropertyById(existingRequest.propertyId);
                if (property) {
                    const newOccupancy = Math.min(property.units, (property.occupiedUnits || 0) + 1);
                    await db.updateProperty(property.id, { occupiedUnits: newOccupancy });
                }
            }

            // Notify Tenant
            await db.addNotification({
                id: crypto.randomUUID(),
                userId: updatedRequest.tenantId,
                role: 'tenant',
                title: 'Application Approved!',
                message: 'Your verification request has been approved by the landlord. Welcome home!',
                type: 'REMARK_ADDED',
                isRead: false,
                createdAt: new Date().toISOString()
            });
        } else if (status === 'moved_out') {
            // CRITICAL: Update TenantStay status to MOVED_OUT
            const endedStay = await db.endTenantStay(updatedRequest.tenantId);

            // Add MOVE_OUT history
            await db.addHistory({
                id: crypto.randomUUID(),
                tenantId: updatedRequest.tenantId,
                type: 'MOVE_OUT',
                description: `Tenant has moved out from the property.`,
                date: new Date().toISOString(),
                createdBy: payload.userId as string
            });

            // UPDATE PROPERTY OCCUPANCY (Decrement)
            if (endedStay && endedStay.propertyId) {
                const property = await db.findPropertyById(endedStay.propertyId);
                if (property) {
                    const newOccupancy = Math.max(0, (property.occupiedUnits || 0) - 1);
                    await db.updateProperty(property.id, { occupiedUnits: newOccupancy });
                }
            }

            // Notify Tenant
            await db.addNotification({
                id: crypto.randomUUID(),
                userId: updatedRequest.tenantId,
                role: 'tenant',
                title: 'Move-Out Recorded',
                message: 'Your landlord has marked you as moved out. You can still download your final report.',
                type: 'REMARK_ADDED',
                isRead: false,
                createdAt: new Date().toISOString()
            });
        } else if (status === 'rejected') {
            // Notify Tenant
            await db.addNotification({
                id: crypto.randomUUID(),
                userId: updatedRequest.tenantId,
                role: 'tenant',
                title: 'Application Rejected',
                message: `Your verification request was not approved. ${remarks ? `Reason: ${remarks}` : ''}`,
                type: 'REMARK_ADDED',
                isRead: false,
                createdAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, request: updatedRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
