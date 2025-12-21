'use client';

import { useEffect, useState } from 'react';
import { History, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/tenant/history');
            const data = await res.json();
            if (data.history) setEvents(data.history);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <Link href="/tenant/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-4 transition">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900">Rental Diary</h1>
                <p className="text-zinc-500 mt-2">A timeline of your rental journey, payments, and events.</p>
            </header>

            {events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-zinc-100">
                    <History className="mx-auto bg-zinc-50 text-zinc-300 rounded-full p-4 mb-4" size={64} />
                    <h3 className="text-lg font-bold text-zinc-900">No History Yet</h3>
                    <p className="text-zinc-500">Events will appear here as they happen.</p>
                </div>
            ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-zinc-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <History size={16} className="text-zinc-500" />
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-zinc-900">{event.type.replace('_', ' ')}</div>
                                    <time className="font-caveat font-medium text-zinc-500 text-sm">{new Date(event.date).toLocaleDateString()}</time>
                                </div>
                                <div className="text-zinc-500 text-sm">{event.description}</div>
                                {event.amount && (
                                    <div className="mt-2 font-black text-indigo-600">${event.amount}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
