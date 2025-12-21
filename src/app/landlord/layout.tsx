'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    ClipboardList,
    LogOut,
    Settings,
    PieChart,
    Bell,
    CreditCard,
    Menu,
    X,
    Building2,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';

export default function LandlordLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { href: "/landlord/dashboard", icon: <PieChart size={20} />, label: "Overview" },
        { href: "/landlord/messages", icon: <MessageSquare size={20} />, label: "Messages" },
        { href: "/landlord/dashboard/requests", icon: <Bell size={20} />, label: "Requests", badge: "New" },
        { href: "/landlord/dashboard/properties", icon: <Building2 size={20} />, label: "Properties" },
        { href: "/landlord/dashboard/tenants", icon: <Users size={20} />, label: "Residents" },
        { href: "/landlord/dashboard/bills", icon: <CreditCard size={20} />, label: "Billing" },
        { href: "/landlord/dashboard/settings", icon: <Settings size={20} />, label: "Settings" },
    ];

    return (
        <SidebarProvider>
            <div className="h-screen bg-[var(--background)] font-sans text-slate-900 flex flex-col md:flex-row overflow-hidden">
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto md:pl-64">
                    <header className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <div className="bg-zinc-900 p-1.5 rounded-lg">
                                <Home className="text-white h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Landlord<span className="text-indigo-600">Portal</span></span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </header>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
