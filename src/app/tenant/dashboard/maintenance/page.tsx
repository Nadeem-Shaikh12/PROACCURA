'use client';

import { useEffect, useState } from 'react';
import {
    Wrench,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertTriangle,
    MessageSquare,
    ChevronDown,
    X,
    Camera
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MaintenanceRequest } from '@/lib/store';

export default function TenantMaintenancePage() {
    const { user, isLoading } = useAuth();
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newRequest, setNewRequest] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
    });

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchRequests();
    }, [user, isLoading]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/maintenance?tenantId=${user?.id}`);
            const data = await res.json();
            if (data.requests) setRequests(data.requests);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: user?.id,
                    landlordId: 'landlord-1', // Mock
                    tenantName: user?.name,
                    propertyName: 'Your Apartment', // Mock
                    ...newRequest
                })
            });
            if (res.ok) {
                setIsAdding(false);
                fetchRequests();
                setNewRequest({ title: '', description: '', priority: 'MEDIUM' });
                alert('Request submitted successfully!');
            }
        } catch (e) {
            alert('Failed to submit request');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-zinc-100 text-zinc-700';
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Maintenance Log...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-xl">
                            <Wrench size={20} />
                        </div>
                        Maintenance Support
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Report issues and track resolution status.</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Report Issue
                </button>
            </header>

            {/* Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Report Incident</h3>
                                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Submit a ticket</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Issue Title</label>
                                    <input
                                        placeholder="e.g. Broken AC"
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        value={newRequest.title}
                                        onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Priority</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all appearance-none"
                                            value={newRequest.priority}
                                            onChange={e => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 text-xs font-bold gap-2 cursor-pointer hover:bg-zinc-100 transition">
                                        <Camera size={16} /> Add Photo
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea
                                        placeholder="Describe the issue in detail..."
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-medium text-sm transition-all min-h-[100px]"
                                        value={newRequest.description}
                                        onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-zinc-900 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-[32px] border border-zinc-100">
                        <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-zinc-900">All Systems Go</h3>
                        <p className="text-zinc-500">No open maintenance issues reported.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xl ${req.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-zinc-50 text-zinc-600'
                                        }`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 group-hover:text-indigo-600 transition">{req.title}</h3>
                                        <p className="text-sm text-zinc-500 line-clamp-1">{req.description}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                                    {req.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-50 pt-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                                </div>
                                <div>ID: {req.id}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
