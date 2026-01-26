'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isDashboard = pathname?.startsWith('/dashboard') ||
        pathname?.startsWith('/landlord') ||
        pathname?.startsWith('/tenant') ||
        pathname?.startsWith('/admin');

    if (isDashboard || isAuthPage) return null;
    return <Navbar />;
}
