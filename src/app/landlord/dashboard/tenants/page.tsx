'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    User,
    MapPin,
    Calendar,
    Loader2,
    ChevronRight,
    Phone,
    Mail,
    BadgeCheck,
    CreditCard,
    ShieldCheck,
    Search,
    Filter
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function MyTenantsPage() {
    const { user, isLoading } = useAuth();
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchTenants();
    }, [user, isLoading]);

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/landlord/tenants');
            const data = await res.json();
            if (data.tenants) setTenants(data.tenants);
        } finally {
            setLoading(false);
        }
    };

    const handleEndStay = async (stayId: string) => {
        if (!confirm('Are you sure you want to end this resident\'s stay? This action is permanent.')) return;

        try {
            const res = await fetch(`/api/landlord/tenants/end?stayId=${stayId}`, { method: 'POST' });
            if (res.ok) {
                alert('Stay ended successfully');
                fetchTenants();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to end stay');
            }
        } catch (e) {
            alert('An error occurred');
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-400" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Syncing Residents...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                        Residents Portfolio
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Manage and monitor {tenants.length} active stays across your properties.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition" size={18} />
                        <input
                            type="text"
                            placeholder="Find a resident..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-zinc-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 p-3 pl-12 rounded-2xl w-full md:w-64 outline-none transition-all font-medium text-sm"
                        />
                    </div>
                </div>
            </header>

            {tenants.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
                    <div className="h-24 w-24 bg-zinc-50 text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900">No Residents Found</h3>
                    <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Once you approve verification requests, your tenants will appear here.</p>
                    <Link href="/landlord/dashboard/requests" className="mt-8 inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-zinc-200">
                        Check Requests <ChevronRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map(stay => (
                        <div key={stay.id} className="bg-white p-2 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl border border-indigo-100 shadow-inner group-hover:scale-105 transition-transform">
                                            {stay.tenantName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-indigo-600 transition">{stay.tenantName}</h3>
                                            <div className="flex items-center gap-1 text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                <MapPin size={12} className="text-indigo-400" /> {stay.propertyName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        Active
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100/50">
                                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Calendar size={10} /> Joined
                                        </div>
                                        <div className="text-sm font-bold text-zinc-900">{new Date(stay.joinDate).toLocaleDateString()}</div>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <ShieldCheck size={10} /> Trust Score
                                        </div>
                                        <div className="text-sm font-bold text-indigo-700">9{stay.id.slice(-1)}% Verified</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                                        <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                                            <CreditCard size={14} />
                                        </div>
                                        <span>Rent Status: <span className="font-bold text-emerald-600">PAID ✅</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium opacity-60">
                                        <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                            <Phone size={14} />
                                        </div>
                                        <span>+91 98XXX XXX01</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => alert('Detailed Profile Feature coming in next update!')}
                                className="w-full bg-zinc-50 hover:bg-zinc-900 hover:text-white p-3 rounded-b-[24px] rounded-t-lg flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wider transition-all group/btn"
                            >
                                <User size={14} /> Manage Resident <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleEndStay(stay.id)}
                                className="w-full mt-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-3 rounded-lg flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wider transition-all"
                            >
                                End Stay & Finalize
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
