'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Hide bottom padding if we are on admin or landing pages (where BottomNav is not present or layout is different)
    const isDashboard = pathname?.startsWith('/landlord') || pathname?.startsWith('/tenant');
    const isAdmin = pathname?.startsWith('/admin');

    // If it's a dashboard (landlord/tenant), we need padding for BottomNav on mobile
    // If it's admin, we don't want the root layout's padding because AdminLayout handles its own.
    const paddingClass = (isDashboard && !isAdmin) ? "pb-20 lg:pb-0" : "";

    return (
        <main className={paddingClass}>
            {children}
        </main>
    );
}
