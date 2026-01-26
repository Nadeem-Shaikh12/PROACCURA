import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function validateUserStatus(userId: string) {
    const user = await db.findUserById(userId);

    if (!user) {
        return { authorized: false, response: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
    }

    if (user.status === 'removed' || user.status === 'inactive') {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Access revoked' }, { status: 403 })
        };
    }

    return { authorized: true, user };
}
