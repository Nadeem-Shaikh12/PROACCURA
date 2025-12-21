'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    MessageSquare,
    CreditCard,
    User,
    Settings,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user) return null;

    const role = user.role === 'landlord' ? 'landlord' : 'tenant';

    const items = user.role === 'landlord' ? [
        { icon: Home, label: 'Home', href: '/landlord/dashboard' },
        { icon: PlusCircle, label: 'Props', href: '/landlord/dashboard/properties' },
        { icon: MessageSquare, label: 'Chat', href: '/landlord/messages' },
        { icon: CreditCard, label: 'Bills', href: '/landlord/dashboard/bills' },
        { icon: Settings, label: 'More', href: '/landlord/dashboard/settings' },
    ] : [
        { icon: Home, label: 'Home', href: '/tenant/dashboard' },
        { icon: CreditCard, label: 'Payments', href: '/tenant/dashboard/history' },
        { icon: MessageSquare, label: 'Chat', href: '/tenant/messages' },
        { icon: User, label: 'Profile', href: '/tenant/dashboard/settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-zinc-100 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-zinc-400 font-medium'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                                <item.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
