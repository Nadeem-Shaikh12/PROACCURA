'use client';
import { useState, useEffect } from 'react';
import { Bell, Calendar, Megaphone, Info, AlertTriangle, PartyPopper } from 'lucide-react';

const TYPE_CONFIG = {
    EVENT: { icon: PartyPopper, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    NOTICE: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    NEWS: { icon: Megaphone, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ALERT: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' }
};

export default function CommunityBoardWidget() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (data.announcements) setAnnouncements(data.announcements.slice(0, 3)); // Top 3
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-slate-50 rounded-[2.5rem]" />;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/60 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Megaphone size={20} className="text-indigo-500" /> Community Board
                </h3>
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{announcements.length} New</span>
            </div>

            <div className="flex-1 space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-xs font-bold uppercase tracking-widest">No updates yet</p>
                    </div>
                ) : (
                    announcements.map(ann => {
                        const style = TYPE_CONFIG[ann.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.NOTICE;
                        const Icon = style.icon;
                        return (
                            <div key={ann.id} className="group flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                <div className={`h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center ${style.bg} ${style.color} ${style.border} border`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${style.bg} ${style.color}`}>{ann.type}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">{new Date(ann.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ann.content}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="w-full mt-6 py-3 rounded-xl border-2 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:border-slate-300 hover:text-slate-700 transition">
                View All Updates
            </button>
        </div>
    );
}
