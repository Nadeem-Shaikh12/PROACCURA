import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function PUT(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const body = await req.json();
        const userId = payload.userId as string;

        // Fetch current user to check role
        const user = await db.findUserById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        let updates: any = {};

        if (user.role === 'landlord') {
            // Landlord specific updates
            const {
                name, mobile, company, address,
                propertyDefaults, tenantPortalSettings,
                documentSettings, financialSettings,
                language, timezone, notificationPreferences
            } = body;

            if (name) updates.name = name;
            if (mobile) updates.mobile = mobile;
            if (company) updates.company = company;
            if (address) updates.address = address;
            if (language) updates.language = language;
            if (timezone) updates.timezone = timezone;
            if (notificationPreferences) updates.notificationPreferences = notificationPreferences;
            if (propertyDefaults) updates.propertyDefaults = propertyDefaults;
            if (tenantPortalSettings) updates.tenantPortalSettings = tenantPortalSettings;
            if (documentSettings) updates.documentSettings = documentSettings;
            if (financialSettings) updates.financialSettings = financialSettings;
        } else {
            // Tenant specific updates (legacy support)
            const { mobile, city, state, aadhaarNumber } = body;
            updates.tenantProfile = {
                ...user.tenantProfile,
                mobile,
                city,
                state,
                aadhaarNumber,
                isProfileComplete: true,
                paymentStatus: user.tenantProfile?.paymentStatus || 'PENDING'
            };
        }

        const updatedUser = await db.updateUser(userId, updates);

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
