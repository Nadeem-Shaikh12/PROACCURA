'use client';

import { useEffect, useState } from 'react';
import {
    User,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    ArrowLeft,
    Building2,
    ShieldAlert,
    ChevronRight,
    BadgeCheck,
    MessageSquare,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface VerificationRequest {
    id: string;
    fullName: string;
    propertyName: string;
    status: string;
    submittedAt: string;
    idProofType: string;
    idProofNumber: string;
}

export default function RequestsPage() {
    const { user, isLoading } = useAuth();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRequests = requests.filter(r =>
        r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.propertyName && r.propertyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchRequests();
    }, [user, isLoading]);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/landlord/requests');
            const data = await res.json();
            if (data.requests) {
                setRequests(data.requests);
            }
        } catch (e) {
            console.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected', remarks?: string) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await fetch('/api/landlord/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: action, remarks })
            });

            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== id));
            } else {
                alert('Action failed');
            }
        } catch (e) {
            alert('Failed to update status');
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-400" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Fetching Applications...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-4">
                        <div className="bg-rose-50 text-rose-600 p-2 rounded-xl">
                            <ShieldAlert size={20} />
                        </div>
                        Pending Applications
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Verify tenant identities and approve their move-in requests.</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition" size={18} />
                    <input
                        type="text"
                        placeholder="Filter by name or property..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-zinc-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 p-3 pl-12 rounded-2xl w-full outline-none transition-all font-medium text-sm"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute inset-0 bg-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative">
                            <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <BadgeCheck size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900">{searchQuery ? 'No Results Found' : 'Inbox Zero 🎉'}</h3>
                            <p className="text-zinc-500 mt-2 max-w-xs mx-auto font-medium">
                                {searchQuery ? `We couldn't find any requests matching "${searchQuery}"` : "No pending requests to review. You're completely up to date!"}
                            </p>
                            <Link href="/landlord/dashboard" className="mt-8 inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-black text-xs uppercase tracking-widest transition-all">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </Link>
                        </div>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req.id} className="bg-white p-2 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-8">
                                {/* Profile Info */}
                                <div className="flex items-center gap-5 flex-1">
                                    <div className="h-16 w-16 bg-gradient-to-tr from-indigo-50 to-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        {req.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-indigo-600 transition">{req.fullName}</h3>
                                            Line 144 was: <h3 className="font-black text-2xl text-zinc-900 leading-tight group-hover:text-indigo-600 transition">{req.fullName}</h3>
                                            Line 144 should be: <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-indigo-600 transition">{req.fullName}</h3>
                                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                                                <Building2 size={12} className="text-indigo-400" /> {req.propertyName || 'Property App'}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                                                <Clock size={12} className="text-zinc-400" /> {new Date(req.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ID Proof Details Card */}
                                <div className="bg-zinc-900 p-5 rounded-2xl flex flex-col justify-between h-auto xl:w-64 relative overflow-hidden">
                                    <div className="absolute -top-4 -right-4 opacity-10">
                                        <BadgeCheck size={100} className="text-white" />
                                    </div>
                                    <div className="relative">
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Identity Document</div>
                                        <div className="text-xs font-bold text-white/90 uppercase tracking-wider">{req.idProofType}</div>
                                        <div className="text-base font-bold text-white tracking-widest mt-1 font-mono">
                                            {req.idProofNumber.slice(0, 4)}••••{req.idProofNumber.slice(-4)}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row xl:flex-col gap-3">
                                    <button
                                        onClick={() => handleAction(req.id, 'approved')}
                                        className="flex-1 px-5 py-3 bg-zinc-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-zinc-200 active:scale-95 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" /> Approve Move-In
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt('Reason for rejection (optional):');
                                            if (reason !== null) handleAction(req.id, 'rejected', reason);
                                        }}
                                        className="flex-1 px-5 py-3 bg-white border border-zinc-200 text-rose-500 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <XCircle size={16} className="group-hover/btn:rotate-90 transition-transform" /> Reject Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
