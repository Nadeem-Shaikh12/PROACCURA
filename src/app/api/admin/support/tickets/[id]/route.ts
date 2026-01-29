import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SupportTicketReply } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ticket = await db.findSupportTicketById(id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        const landlord = await db.findUserById(ticket.landlordId);

        return NextResponse.json({
            ...ticket,
            landlordName: landlord?.name || 'Unknown'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ticket = await db.findSupportTicketById(id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        const body = await req.json();
        const { content, authorName, status } = body;

        let updates: any = {};

        if (content) {
            const newReply: SupportTicketReply = {
                id: nanoid(),
                authorId: 'admin', // Placeholder for admin ID
                authorName: authorName || 'Support Team',
                authorRole: 'support',
                content,
                createdAt: new Date().toISOString()
            };
            updates.replies = [...ticket.replies, newReply];
            updates.status = 'AWAITING_REPLY'; // Notify landlord that a reply is waiting
        }

        if (status) {
            updates.status = status;
        }

        const updatedTicket = await db.updateSupportTicket(id, updates);
        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket by admin:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
