import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function PUT(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { currentPassword, newPassword } = await req.json();
        const userId = payload.userId as string;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Fetch current user
        const user = await db.findUserById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
        }

        // Validate new password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json({ error: 'New password does not meet security requirements' }, { status: 400 });
        }

        // Hash and save new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await db.updateUser(userId, { passwordHash });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error("Password Update Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
