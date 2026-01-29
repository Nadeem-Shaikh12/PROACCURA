import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();
        const normalizedEmail = email?.toLowerCase().trim();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (role === 'admin') {
            return NextResponse.json({ error: 'Unauthorized role assignment' }, { status: 403 });
        }

        // Backend Validation
        if (!normalizedEmail) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({ error: 'Password does not meet security requirements' }, { status: 400 });
        }

        const existingUser = await db.findUserByEmail(normalizedEmail);

        if (existingUser) {
            // Check if user is 'removed' - if so, allow "resurrection" (Re-registration)
            if (existingUser.status === 'removed') {
                const passwordHash = await bcrypt.hash(password, 10);

                // Update the existing user record
                const updatedUser = await db.updateUser(existingUser.id, {
                    name,
                    passwordHash,
                    role,
                    status: role === 'tenant' ? 'inactive' : 'active',
                    // Reset profile data if needed, or keep history. 
                    // For now, let's keep it simple and just reactivate the account.
                    // If tenant, they will need to complete profile again if we reset it, 
                    // or usage existing profile. Let's assume we keep profile but require verification again.
                });

                if (!updatedUser) {
                    return NextResponse.json({ error: 'Failed to reactivate account' }, { status: 500 });
                }

                // Create JWT
                const token = await new SignJWT({ userId: updatedUser.id, role: updatedUser.role, name: updatedUser.name, email: updatedUser.email })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setExpirationTime('30d')
                    .sign(JWT_SECRET);

                const response = NextResponse.json({
                    success: true,
                    user: {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        role: updatedUser.role
                    }
                });

                response.cookies.set({
                    name: 'token',
                    value: token,
                    httpOnly: true,
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                });

                return response;
            } else {
                return NextResponse.json({ error: 'User already exists' }, { status: 409 });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = nanoid();

        const newUser = await db.addUser({
            id: userId,
            name,
            email: normalizedEmail,
            passwordHash,
            role,
            status: role === 'tenant' ? 'inactive' : 'active',
            mobile: ''
        });

        // Create JWT
        const token = await new SignJWT({ userId: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
