'use client';

import {
    LayoutDashboard,
    Users,
    Building2,
    MessageCircle,
    Settings,
    LogOut,
    ShieldCheck,
    CreditCard,
    Loader2,
    Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Support Queue', href: '/admin/support', icon: MessageCircle },
    { label: 'User Hub', href: '/admin/users', icon: Users },
    { label: 'Manage Properties', href: '/admin/properties', icon: Building2 },
    { label: 'Platform Revenue', href: '/admin/revenue', icon: CreditCard },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
    { label: 'Security Logs', href: '/admin/security', icon: Fingerprint },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user, isLoading } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-100 shadow-xl shadow-rose-500/10">
                    <ShieldCheck className="text-rose-500" size={40} />
                </div>
                <h1 className="text-3xl font-black text-zinc-900 tracking-tighter mb-2 uppercase">Access Denied</h1>
                <p className="text-zinc-500 font-medium max-w-sm mb-8 leading-relaxed">
                    This sector is restricted to platform administrators only. If you believe this is a mistake, please contact tech support.
                </p>
                <Link
                    href="/login"
                    className="px-8 py-3.5 bg-zinc-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-zinc-900/20"
                >
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-zinc-50 flex">
                {/* Mobile Header */}
                <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between z-[60]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-zinc-900" size={24} />
                        <span className="text-lg font-black tracking-tight">PRO<span className="text-zinc-400">ADMIN</span></span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Sidebar */}
                <aside className={`w-72 bg-white border-r border-zinc-200 flex flex-col fixed inset-y-0 left-0 z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-8 hidden lg:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                                <ShieldCheck className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-black text-zinc-900 tracking-tight">PRO<span className="text-zinc-400">ADMIN</span></span>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1.5 mt-4">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${pathname === item.href
                                    ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200 scale-[1.02]'
                                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                                    }`}
                            >
                                <item.icon size={20} className={pathname === item.href ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-6 border-t border-zinc-100">
                        <div className="bg-zinc-50 p-4 rounded-2xl mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                    {user?.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-zinc-500">{user?.name[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-zinc-900 truncate uppercase">{user?.name}</p>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Platform Admin</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 lg:ml-72 pt-20 lg:pt-8 px-6 lg:px-10 pb-20 transition-all duration-300">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </SidebarProvider>
    );
}
