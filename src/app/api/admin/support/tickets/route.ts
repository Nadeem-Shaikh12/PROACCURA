import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const tickets = await db.getAllSupportTickets();

        // Enrich with landlord names
        const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
            const landlord = await db.findUserById(ticket.landlordId);
            return {
                ...ticket,
                landlordName: landlord?.name || 'Unknown Landlord'
            };
        }));

        return NextResponse.json(enrichedTickets);
    } catch (error) {
        console.error('Error fetching admin tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}
