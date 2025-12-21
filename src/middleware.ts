import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    console.log(`Middleware checking: ${pathname}`);

    // Public paths
    const publicPaths = ['/login', '/register', '/api/auth', '/'];
    if (publicPaths.some(path => pathname.startsWith(path)) || pathname.includes('.')) {
        return NextResponse.next();
    }

    if (!token) {
        // Redirect to login if trying to access dashboard without token
        if (pathname.startsWith('/tenant') || pathname.startsWith('/landlord')) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        return NextResponse.next();
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        console.log(`User role: ${role}, Path: ${pathname}`);

        // Tenant Route Protection
        if (pathname.startsWith('/tenant') && role !== 'tenant') {
            console.log('Redirecting landlord to landlord dashboard');
            return NextResponse.redirect(new URL('/landlord/dashboard', req.url));
        }

        // Landlord Route Protection
        if (pathname.startsWith('/landlord') && role !== 'landlord') {
            console.log('Redirecting tenant to tenant dashboard');
            return NextResponse.redirect(new URL('/tenant/dashboard', req.url));
        }

        // Root redirect
        if (pathname === '/dashboard') {
            if (role === 'tenant') return NextResponse.redirect(new URL('/tenant/dashboard', req.url));
            if (role === 'landlord') return NextResponse.redirect(new URL('/landlord/dashboard', req.url));
        }

        return NextResponse.next();
    } catch (err) {
        console.error('Middleware Token Error:', err);
        // Invalid token, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('token');
        return response;
    }
}

export const config = {
    matcher: ['/tenant/:path*', '/landlord/:path*', '/dashboard/:path*']
};
