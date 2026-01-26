import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SupportTicket } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
    const landlordId = req.nextUrl.searchParams.get('landlordId');
    if (!landlordId) return NextResponse.json({ error: 'Missing landlordId' }, { status: 400 });

    try {
        const tickets = await db.getSupportTickets(landlordId);
        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { landlordId, subject, category, description, priority } = body;

        if (!landlordId || !subject || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newTicket: SupportTicket = {
            id: `TIC-${nanoid(8).toUpperCase()}`,
            landlordId,
            subject,
            category: category || 'OTHER',
            description,
            status: 'OPEN',
            priority: priority || 'NORMAL',
            attachments: [],
            replies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const savedTicket = await db.addSupportTicket(newTicket);
        return NextResponse.json(savedTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}
