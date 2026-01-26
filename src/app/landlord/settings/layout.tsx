'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    Shield,
    Bell,
    Building,
    Users,
    FileText,
    CreditCard,
    Globe,
    Palette,
    Link as LinkIcon,
    HelpCircle
} from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const settingsNav = [
        { href: '/landlord/settings/account', label: 'Account & Profile', icon: <User size={18} /> },
        { href: '/landlord/settings/security', label: 'Security & Access', icon: <Shield size={18} /> },
        { href: '/landlord/settings/notifications', label: 'Notification Preferences', icon: <Bell size={18} /> },
        { href: '/landlord/settings/properties', label: 'Property Defaults', icon: <Building size={18} /> },
        { href: '/landlord/settings/portal', label: 'Tenant Portal', icon: <Users size={18} /> },
        { href: '/landlord/settings/documents', label: 'Documents & Files', icon: <FileText size={18} /> },
        { href: '/landlord/settings/financial', label: 'Financial & Payments', icon: <CreditCard size={18} /> },
        { href: '/landlord/settings/localization', label: 'Language & Locale', icon: <Globe size={18} /> },
        { href: '/landlord/settings/theme', label: 'Theme & Dashboard', icon: <Palette size={18} /> },
        { href: '/landlord/settings/integrations', label: 'Integrations & API', icon: <LinkIcon size={18} /> },
        { href: '/landlord/settings/support', label: 'Help & Support', icon: <HelpCircle size={18} /> },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Settings Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden sticky top-4">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                        <h2 className="font-bold text-zinc-900">Settings</h2>
                        <p className="text-xs text-zinc-500">Manage your account and preferences</p>
                    </div>
                    <nav className="p-2 space-y-1">
                        {settingsNav.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 min-h-[600px] p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
