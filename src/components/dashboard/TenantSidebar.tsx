'use client';

import { LayoutDashboard, Home, FileText, Settings, HelpCircle, BadgeCheck, Clock, X, Wrench, MessageCircle, CreditCard, Sparkles, Megaphone, FileSignature } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

export default function TenantSidebar() {
    const { isOpen, closeSidebar } = useSidebar();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/tenant/dashboard' },
        { icon: MessageCircle, label: 'Messages', href: '/tenant/messages' },
        { icon: CreditCard, label: 'Billing', href: '/tenant/dashboard/bills' },
        { icon: FileSignature, label: 'Lease Info', href: '/tenant/dashboard/lease' },
        { icon: Wrench, label: 'Maintenance', href: '/tenant/dashboard/maintenance' },
        { icon: Megaphone, label: 'Community', href: '/tenant/dashboard/community' },
        { icon: FileText, label: 'Documents', href: '/tenant/dashboard/documents' },
        { icon: Clock, label: 'History', href: '/tenant/dashboard/history' },
        { icon: Settings, label: 'Settings', href: '/tenant/dashboard/settings' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`
                fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 
                flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-2 font-bold text-blue-600">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Home size={18} />
                        </div>
                        <span className="text-xl tracking-tight text-slate-900 font-black italic">Prop<span className="text-blue-600">Accura</span></span>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group cursor-pointer hover:bg-emerald-100 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                            <HelpCircle size={16} /> Help Center
                        </div>
                        <p className="text-[10px] text-emerald-600/70 mb-3 font-medium">Questions about your stay?</p>
                        <button className="w-full py-2 bg-white border border-emerald-200 rounded-lg text-xs font-black text-emerald-600 transition shadow-sm group-hover:scale-[1.02]">
                            Open Support
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
