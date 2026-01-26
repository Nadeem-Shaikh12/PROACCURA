'use client';
import { Wrench, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MaintenancePreviewWidget({ userId }: { userId: string }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch or real fetch
        fetch(`/api/maintenance`) // Correct endpoint handles role via token
            .then(res => res.json())
            .then(data => {
                if (data.requests) {
                    setRequests(data.requests.slice(0, 3)); // Top 3
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'IN_PROGRESS': return <Clock size={14} className="text-amber-500" />;
            default: return <AlertCircle size={14} className="text-zinc-400" />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                    <Wrench size={18} className="text-orange-500" /> Maintenance
                </h3>
                <Link href="/tenant/dashboard/maintenance" className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:underline">
                    View All
                </Link>
            </div>

            <div className="space-y-4 flex-1">
                {requests.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">
                        <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">No active requests</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100/50">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${req.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-white text-zinc-500'}`}>
                                <Wrench size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-sm text-zinc-900 truncate">{req.title}</h4>
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                    {getStatusIcon(req.status)} {req.status}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Link href="/tenant/dashboard/maintenance" className="mt-6 w-full py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all">
                Report Issue <ArrowRight size={14} />
            </Link>
        </div>
    );
}
