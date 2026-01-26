'use client';
import { useState, useEffect } from 'react';
import { Announcement } from '@/lib/types';
import { Megaphone, Calendar, Search, Filter, PartyPopper, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const TYPE_CONFIG = {
    EVENT: { icon: PartyPopper, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', label: 'Event' },
    NOTICE: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Notice' },
    NEWS: { icon: Megaphone, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'News' },
    ALERT: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Alert' }
};

export default function TenantCommunityPage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (data.announcements) setAnnouncements(data.announcements);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = announcements.filter(a => {
        if (filter !== 'ALL' && a.type !== filter) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.content.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen space-y-8">
            <header>
                <Link href="/tenant/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-6 transition">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                <Megaphone size={24} />
                            </div>
                            Community Hub
                        </h1>
                        <p className="text-zinc-500 mt-2 font-medium">Updates, events, and notices from your building management.</p>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search announcements..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'EVENT', 'NOTICE', 'NEWS', 'ALERT'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition whitespace-nowrap border ${filter === f
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-50 rounded-[2rem] animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
                    <Megaphone size={48} className="mx-auto text-zinc-200 mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900">No announcements found</h3>
                    <p className="text-zinc-500 mt-2">Check back later for updates.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtered.map(ann => {
                        const style = TYPE_CONFIG[ann.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.NOTICE;
                        const Icon = style.icon;
                        return (
                            <div key={ann.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col md:flex-row gap-6">
                                <div className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl flex-shrink-0 flex items-center justify-center ${style.bg} ${style.color} border ${style.border}`}>
                                    <Icon size={32} />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
                                            {style.label}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                                            <Calendar size={14} /> {new Date(ann.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-zinc-900 leading-tight">{ann.title}</h3>
                                    <p className="text-zinc-600 leading-relaxed font-medium">{ann.content}</p>
                                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-zinc-400">
                                        Posted by <span className="text-zinc-900">{ann.authorName}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
