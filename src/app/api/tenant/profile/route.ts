import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function PUT(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const body = await req.json();
        const { name, email, mobile, password, language, timezone, profilePhoto, notificationPreferences, portalPreferences, securitySettings, privacySettings } = body;

        const updates: any = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (mobile) updates.mobile = mobile;
        if (language) updates.language = language;
        if (timezone) updates.timezone = timezone;
        if (profilePhoto) updates.profilePhoto = profilePhoto;
        if (notificationPreferences) updates.notificationPreferences = notificationPreferences;
        if (portalPreferences) updates.portalPreferences = portalPreferences;
        if (securitySettings) updates.securitySettings = securitySettings;
        if (privacySettings) updates.privacySettings = privacySettings;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.passwordHash = await bcrypt.hash(password, salt);
        }

        // Handle tenantProfile update for mobile separately if needed, 
        // but for now we updated the root user object mobile as well.
        // Let's also update tenantProfile.mobile if it exists
        const user = await db.findUserById(userId);
        if (user && user.tenantProfile && mobile) {
            const updatedProfile = { ...user.tenantProfile, mobile };
            updates.tenantProfile = updatedProfile;
        }

        const updatedUser = await db.updateUser(userId, updates);

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
