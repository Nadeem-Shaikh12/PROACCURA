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
        const role = payload.role;

        if (role === 'landlord') {
            const tenants = db.getLandlordTenants(payload.userId as string);
            // Deduplicate tenants if needed, mapping to minimal contact info
            const contacts = tenants.map(t => ({
                id: t.tenantId,
                name: t.tenantName,
                propertyName: t.propertyName,
                role: 'tenant'
            }));

            // Remove duplicates (same tenant in multiple units?) - Usually fine to list per unit or unique
            // For simplicity, unique by ID
            const uniqueContacts = Array.from(new Map(contacts.map(item => [item.id, item])).values());

            return NextResponse.json({ contacts: uniqueContacts });

        } else if (role === 'tenant') {
            const stay = db.getTenantStay(payload.userId as string);
            if (!stay) {
                return NextResponse.json({ contacts: [] });
            }

            const property = db.findPropertyById(stay.propertyId);
            const landlord = property ? db.findUserById(property.landlordId) : null;

            if (landlord) {
                return NextResponse.json({
                    contacts: [{
                        id: landlord.id,
                        name: landlord.name,
                        role: 'landlord',
                        propertyName: property?.name // Context
                    }]
                });
            }

            return NextResponse.json({ contacts: [] });
        }

        return NextResponse.json({ error: 'Invalid Code Path' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
