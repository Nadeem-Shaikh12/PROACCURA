'use client';

import { useEffect, useState } from 'react';
import {
    Wrench,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertTriangle,
    MoreVertical,
    Building2,
    User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MaintenanceRequest } from '@/lib/store';

export default function LandlordMaintenancePage() {
    const { user, isLoading } = useAuth();
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchRequests();
    }, [user, isLoading]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/maintenance?landlordId=${user?.id}`);
            const data = await res.json();
            if (data.requests) setRequests(data.requests);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/maintenance', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) fetchRequests();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            default: return 'bg-zinc-50 text-zinc-600';
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Tickets...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                            <Wrench size={20} />
                        </div>
                        Maintenance Board
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Manage and resolve tenant reported issues.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-zinc-50 transition">
                        <Filter size={14} /> Filter
                    </button>
                    <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-zinc-50 transition">
                        <Search size={14} /> Search
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
                        <CheckCircle2 className="mx-auto text-emerald-300 mb-6" size={64} />
                        <h3 className="text-xl font-bold text-zinc-900">Zero Defects</h3>
                        <p className="text-zinc-500 mt-2">All properties are in good condition.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col lg:flex-row gap-6">
                            {/* Status Stripe */}
                            <div className={`w-2 rounded-full self-stretch flex-shrink-0 ${req.status === 'OPEN' ? 'bg-amber-400' :
                                req.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-emerald-400'
                                }`}></div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                    {req.priority === 'HIGH' && (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                                            <AlertTriangle size={10} /> High Priority
                                        </span>
                                    )}
                                    <span className="text-xs font-bold text-zinc-400 ml-auto flex items-center gap-1">
                                        <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-zinc-900 mb-1">{req.title}</h3>
                                <p className="text-sm text-zinc-500 mb-4">{req.description}</p>

                                <div className="flex items-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-indigo-400" /> {req.tenantName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building2 size={14} className="text-emerald-400" /> {req.propertyName}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex lg:flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l border-zinc-50 pt-4 lg:pt-0 lg:pl-6">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest text-center lg:text-left mb-1 hidden lg:block">Actions</span>
                                {req.status === 'OPEN' && (
                                    <button
                                        onClick={() => updateStatus(req.id, 'IN_PROGRESS')}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition whitespace-nowrap"
                                    >
                                        Mark In Progress
                                    </button>
                                )}
                                {req.status !== 'RESOLVED' && (
                                    <button
                                        onClick={() => updateStatus(req.id, 'RESOLVED')}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-100 transition whitespace-nowrap"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
