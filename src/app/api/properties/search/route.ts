import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q')?.toLowerCase() || '';

        // Get all properties (in a real app, this would be paginated and optimized)
        // Since we don't have a direct "getAllProperties" public method, we might need one or fetch all from landlords.
        // Let's add a generic getProperties method to db or iterate. 
        // Current db.getProperties takes landlordId. 
        // We will read the whole DB file (it's JSON) or add a helper.
        // Let's stick to what we have or modify DBAdapter.
        // Actually, we can use db.data if exposed or add a method.
        // I'll assume we add `getAllProperties()` to DB or just simulate it for now by fetching all landlords then properties? No that's slow.
        // Let's just use what we have: I'll add `getAllProperties` to db.ts in the next step or use `getProperties` with a wildcard?

        // Wait, I can modify db.ts. 
        // For now, let's implement the route assuming `getAllProperties` exists, and I will add it to db.ts immediately.

        const properties = db.getAllProperties();

        const filtered = properties
            .filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.address.toLowerCase().includes(query) ||
                p.type.toLowerCase().includes(query)
            )
            .map(p => {
                const landlord = db.findUserById(p.landlordId);
                return {
                    ...p,
                    landlordName: landlord?.name || 'Unknown Landlord'
                };
            });

        return NextResponse.json({ properties: filtered });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
