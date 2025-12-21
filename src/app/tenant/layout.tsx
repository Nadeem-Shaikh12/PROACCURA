'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import TenantSidebar from '@/components/dashboard/TenantSidebar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { Menu, Home, X } from 'lucide-react';

function TenantLayoutContent({ children }: { children: React.ReactNode }) {
    const { toggleSidebar, isOpen } = useSidebar();

    return (
        <div className="min-h-screen bg-[var(--background)] font-sans text-slate-900 flex flex-col md:flex-row h-screen overflow-hidden">
            <TenantSidebar />

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto md:pl-64">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-50">
                    <Link href="/tenant/dashboard" className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                            <Home className="text-white h-5 w-5" />
                        </div>
                        <span className="font-black text-lg tracking-tight italic">PRO<span className="text-blue-600">ACCURA</span></span>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-500 hover:text-blue-600"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>
                {children}
            </main>
        </div>
    );
}

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <TenantLayoutContent>
                {children}
            </TenantLayoutContent>
        </SidebarProvider>
    )
}
