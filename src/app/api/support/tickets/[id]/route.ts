import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SupportTicketReply } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ticket = await db.findSupportTicketById(params.id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        return NextResponse.json(ticket);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ticket = await db.findSupportTicketById(params.id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        const body = await req.json();
        const { content, authorId, authorName, status } = body;

        let updates: any = {};

        if (content) {
            const newReply: SupportTicketReply = {
                id: nanoid(),
                authorId,
                authorName,
                authorRole: 'landlord',
                content,
                createdAt: new Date().toISOString()
            };
            updates.replies = [...ticket.replies, newReply];
            updates.status = 'AWAITING_REPLY'; // Automatically set to awaiting reply from support
        }

        if (status) {
            updates.status = status;
        }

        const updatedTicket = await db.updateSupportTicket(params.id, updates);
        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
