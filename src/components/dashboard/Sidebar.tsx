import { LayoutDashboard, Users, Home, Settings, LogOut, FileText, X, PieChart, ShieldCheck, Wrench, MessageCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/landlord/dashboard' },
        { icon: MessageCircle, label: 'Messages', href: '/landlord/messages' },
        { icon: Home, label: 'Properties', href: '/landlord/dashboard/properties' },
        { icon: Users, label: 'Tenants', href: '/landlord/dashboard/tenants' },
        { icon: CreditCard, label: 'Billing', href: '/landlord/dashboard/bills' },
        { icon: Wrench, label: 'Maintenance', href: '/landlord/dashboard/maintenance' },
        { icon: FileText, label: 'Documents', href: '/landlord/dashboard/documents' },
        { icon: PieChart, label: 'Reports', href: '/landlord/dashboard/reports' }, // New Reports Link
        { icon: FileText, label: 'Requests', href: '/landlord/dashboard/requests' },
        { icon: Settings, label: 'Settings', href: '/landlord/dashboard/settings' },
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
                <div className="p-8 pb-10 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 italic">
                            PRO<span className="text-blue-600">ACCURA</span>
                        </h1>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-6 space-y-1.5 mt-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <div className="p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 group cursor-pointer hover:bg-emerald-100 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">Portfolio Analytics</p>
                        <button className="text-sm font-black text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-2">
                            Secure Stats Room →
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
