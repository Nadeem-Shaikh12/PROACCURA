import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // Public paths that should redirect to dashboard if logged in
    const authPaths = ['/login', '/register', '/'];

    // Static assets and API auth routes should always pass
    if (pathname.includes('.') || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (!token) {
        // Redirect to login if trying to access dashboard/protected routes without token
        if (pathname.startsWith('/tenant') || pathname.startsWith('/landlord') || pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        return NextResponse.next();
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        // If user is logged in and trying to access auth pages (Login, Register, Landing), redirect to dashboard
        if (authPaths.includes(pathname)) {
            if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
            if (role === 'tenant') return NextResponse.redirect(new URL('/tenant/dashboard', req.url));
            if (role === 'landlord') return NextResponse.redirect(new URL('/landlord/dashboard', req.url));
        }

        // Tenant Route Protection
        if (pathname.startsWith('/tenant') && role !== 'tenant') {
            return NextResponse.redirect(new URL('/landlord/dashboard', req.url));
        }

        // Landlord Route Protection
        if (pathname.startsWith('/landlord') && role !== 'landlord') {
            return NextResponse.redirect(new URL('/tenant/dashboard', req.url));
        }

        // Admin Route Protection
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Root redirect for /dashboard
        if (pathname === '/dashboard') {
            if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
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
    matcher: ['/', '/login', '/register', '/tenant/:path*', '/landlord/:path*', '/dashboard/:path*', '/admin/:path*']
};
