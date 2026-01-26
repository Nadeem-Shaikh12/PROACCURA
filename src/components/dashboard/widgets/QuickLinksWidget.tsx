'use client';
import { CreditCard, Wrench, FileText, MessageSquare, Settings, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

export default function QuickLinksWidget() {
    const links = [
        { icon: CreditCard, label: 'Pay Rent', href: '/tenant/dashboard/bills', color: 'text-violet-500', bg: 'bg-violet-50' },
        { icon: Wrench, label: 'Fix It', href: '/tenant/dashboard/maintenance', color: 'text-orange-500', bg: 'bg-orange-50' },
        { icon: FileText, label: 'Docs', href: '/tenant/dashboard/documents', color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: MessageSquare, label: 'Chat', href: '/tenant/messages', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { icon: BadgeCheck, label: 'Lease', href: '/tenant/dashboard/lease', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { icon: Settings, label: 'Settings', href: '/tenant/dashboard/settings', color: 'text-zinc-500', bg: 'bg-zinc-50' },
    ];

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-zinc-500 text-xs mb-6 uppercase tracking-wider pl-2">Quick Access</h3>
            <div className="grid grid-cols-3 gap-4">
                {links.map((link) => (
                    <Link key={link.label} href={link.href} className="flex flex-col items-center gap-2 group">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${link.bg} ${link.color} transition-transform group-hover:scale-110 shadow-sm`}>
                            <link.icon size={24} />
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-600 group-hover:text-zinc-900">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
