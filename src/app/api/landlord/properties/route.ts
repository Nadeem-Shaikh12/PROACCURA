import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const landlordId = searchParams.get('landlordId');

        if (!landlordId) {
            return NextResponse.json({ error: 'Missing landlordId' }, { status: 400 });
        }

        const properties = await db.getProperties(landlordId);
        return NextResponse.json({ properties });
    } catch (e) {
        console.error("Properties API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { landlordId, name, address, units, type, monthlyRent } = body;

        if (!landlordId || !name || !address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newProperty = await db.addProperty({
            id: Math.random().toString(36).substr(2, 9),
            landlordId,
            name,
            address,
            units: parseInt(units) || 1,
            occupiedUnits: 0,
            type: type || 'Apartment',
            monthlyRent: parseInt(monthlyRent) || 0,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ property: newProperty });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, landlordId, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await db.updateProperty(id, updates);
        return NextResponse.json({ property: updated });
    } catch (e) {
        return NextResponse.json({ error: 'Update failed' }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.deleteProperty(id);
    return NextResponse.json({ success: true });
}
