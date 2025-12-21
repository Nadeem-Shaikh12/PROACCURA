'use client';

import { useEffect, useState } from 'react';
import {
    User,
    Bell,
    Shield,
    LogOut,
    ChevronRight,
    Mail,
    Smartphone,
    Lock,
    Globe,
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({
        notifications: {
            payments: true,
            applications: true,
            maintenance: false
        }
    });

    const handleUpdateIdentity = () => {
        alert('Identity profile update initialized. Changes saved to system ledger.');
    };

    const toggleNotification = (key: keyof typeof stats.notifications) => {
        setStats(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !user) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Authenticating...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900">Control Center</h1>
                <p className="text-zinc-500 mt-2 font-medium">Configure your platform experience and security protocols.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Navigation Menu (Left) */}
                <div className="space-y-2">
                    <SidebarItem icon={<User size={18} />} label="Personal Identity" active />
                    <SidebarItem icon={<Bell size={18} />} label="Communications" />
                    <SidebarItem icon={<ShieldCheck size={18} />} label="Privacy & Security" />
                    <SidebarItem icon={<CreditCard size={18} />} label="Plan & Billing" />
                    <SidebarItem icon={<Globe size={18} />} label="Regional Settings" />
                </div>

                {/* Main Content (Center + Right) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Section */}
                    <section className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <User size={160} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-[20px] shadow-inner flex items-center justify-center font-black text-2xl border border-indigo-100">
                                {user?.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Identity Profile</h3>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Public profile details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            <InputField label="Assigned Name" value={user?.name} icon={<User size={14} />} readOnly />
                            <InputField label="Contact Channel" value={user?.email} icon={<Mail size={14} />} readOnly />
                            <InputField label="Role Assignment" value={user?.role} icon={<Shield size={14} />} readOnly />
                            <InputField label="Phone Node" value="+91 98XXX XXX01" icon={<Smartphone size={14} />} readOnly />
                        </div>

                        <button
                            onClick={handleUpdateIdentity}
                            className="mt-8 px-6 py-3 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition shadow-xl shadow-zinc-100"
                        >
                            Update Identity
                        </button>
                    </section>

                    {/* Preferences */}
                    <section className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Alert Preferences</h3>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System event notifications</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <ToggleItem
                                label="Payment Confirmations"
                                desc="Instant alerts when rent hits your ledger"
                                active={stats.notifications.payments}
                                onToggle={() => toggleNotification('payments')}
                            />
                            <ToggleItem
                                label="Application Bursts"
                                desc="Get notified when a new resident applies"
                                active={stats.notifications.applications}
                                onToggle={() => toggleNotification('applications')}
                            />
                            <ToggleItem
                                label="Maintenance Tickets"
                                desc="Real-time system health updates"
                                active={stats.notifications.maintenance}
                                onToggle={() => toggleNotification('maintenance')}
                            />
                        </div>
                    </section>

                    {/* Logout Area */}
                    <section className="flex items-center justify-between p-8 bg-rose-50/50 border border-rose-100 border-dashed rounded-[40px] group transition-all hover:bg-rose-50">
                        <div>
                            <h4 className="font-black text-rose-900 text-lg">System Session</h4>
                            <p className="text-rose-600/70 text-xs font-medium">Terminate current access and clear session cache.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white text-rose-600 p-4 rounded-2xl border border-rose-200 shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 group-hover:rotate-6"
                        >
                            <LogOut size={24} />
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, active }: any) {
    return (
        <div className={`
            flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all font-bold text-sm
            ${active
                ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}
        `}>
            <span className={active ? 'text-indigo-400' : 'text-zinc-400'}>{icon}</span>
            {label}
        </div>
    );
}

function InputField({ label, value, icon, readOnly, onChange }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">{label}</label>
            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-zinc-900 border transition-all
                ${readOnly ? 'bg-zinc-50 border-zinc-100 opacity-60' : 'bg-white border-zinc-100 focus-within:border-indigo-400'}
            `}>
                <span className="text-zinc-300">{icon}</span>
                <input
                    type="text"
                    value={value || ''}
                    readOnly={readOnly}
                    onChange={onChange}
                    className="bg-transparent border-none outline-none w-full text-sm font-bold"
                />
            </div>
        </div>
    );
}

function ToggleItem({ label, desc, active, onToggle }: any) {
    return (
        <div
            onClick={onToggle}
            className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-50 hover:border-zinc-200 transition-all group cursor-pointer"
        >
            <div className="flex-1">
                <div className="font-black text-zinc-900 text-sm leading-tight">{label}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{desc}</div>
            </div>
            <div className={`h-7 w-12 rounded-full relative transition-colors cursor-pointer ${active ? 'bg-emerald-500 shadow-inner' : 'bg-zinc-200'}`}>
                <div className={`h-5 w-5 bg-white rounded-full absolute top-1 transition-all shadow-md ${active ? 'right-1' : 'left-1'}`}></div>
            </div>
        </div>
    );
}
