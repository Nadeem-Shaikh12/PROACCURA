'use client';

import { useState, useEffect } from 'react';
import {
    MessageCircle,
    Search,
    ChevronRight,
    Clock,
    ArrowLeft,
    Send,
    Loader2,
    Filter,
    User,
    CheckCircle2,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { SupportTicket } from '@/lib/types';

interface EnrichedTicket extends SupportTicket {
    landlordName: string;
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<EnrichedTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<EnrichedTicket | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/support/tickets');
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching admin tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (ticketId: string, content: string) => {
        setReplying(true);
        try {
            const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    authorName: 'Admin Support'
                })
            });
            if (res.ok) {
                const updated = await res.json();
                // Refresh local ticket state
                const enriched = { ...updated, landlordName: selectedTicket?.landlordName };
                setSelectedTicket(enriched);
                setTickets(tickets.map(t => t.id === ticketId ? enriched : t));
            }
        } catch (err) {
            console.error('Error replying as admin:', err);
        } finally {
            setReplying(false);
        }
    };

    const updateStatus = async (ticketId: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updated = await res.json();
                const enriched = { ...updated, landlordName: selectedTicket?.landlordName };
                if (selectedTicket?.id === ticketId) setSelectedTicket(enriched);
                setTickets(tickets.map(t => t.id === ticketId ? enriched : t));
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.landlordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || t.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
                    <p className="text-zinc-500 font-medium">Loading Support Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Support Hub</span>
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Active Inquiries</h1>
                    <p className="text-zinc-500 font-medium">Manage and resolve landlord technical tickets.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tickets or landlords..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition w-64 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white border border-zinc-200 p-1 rounded-xl shadow-sm">
                        <select
                            className="bg-transparent text-sm font-bold px-3 py-1.5 focus:outline-none cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="AWAITING_REPLY">Awaiting Reply</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Ticket List */}
                <div className={`lg:col-span-5 space-y-4 ${selectedTicket ? 'hidden lg:block' : ''}`}>
                    {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`w-full p-5 text-left bg-white border rounded-2xl transition group relative overflow-hidden ${selectedTicket?.id === ticket.id
                                ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-lg'
                                : 'border-zinc-200 hover:border-zinc-400 hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">#{ticket.id}</span>
                                    <h3 className="font-bold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition">{ticket.subject}</h3>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ticket.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' :
                                    ticket.priority === 'NORMAL' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                                    <User size={14} className="text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-900">{ticket.landlordName}</p>
                                    <p className="text-[10px] text-zinc-400">{ticket.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                                    <Clock size={12} />
                                    {new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-indigo-50 text-indigo-600' :
                                    ticket.status === 'AWAITING_REPLY' ? 'bg-rose-50 text-rose-600 animate-pulse' :
                                        ticket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-zinc-100 text-zinc-500'
                                    }`}>
                                    {ticket.status.replace('_', ' ')}
                                </div>
                            </div>
                        </button>
                    )) : (
                        <div className="p-12 text-center bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
                            <AlertCircle className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <p className="text-zinc-500 font-bold">No tickets found</p>
                        </div>
                    )}
                </div>

                {/* Ticket Detail */}
                <div className={`lg:col-span-7 h-[calc(100vh-280px)] min-h-[600px] flex flex-col bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl ${!selectedTicket ? 'hidden lg:flex items-center justify-center' : 'flex'
                    }`}>
                    {selectedTicket ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="lg:hidden p-2 hover:bg-white rounded-lg transition"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-zinc-400">#{selectedTicket.id}</span>
                                            <h2 className="font-black text-zinc-900 text-lg uppercase tracking-tight">{selectedTicket.subject}</h2>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 mt-0.5">
                                            <span className="text-zinc-900">{selectedTicket.landlordName}</span>
                                            <span>•</span>
                                            <span className="text-indigo-600">{selectedTicket.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none shadow-sm"
                                        value={selectedTicket.status}
                                        onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="AWAITING_REPLY">Awaiting Reply</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Thread */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white/50 backdrop-blur-sm">
                                {/* Original Description */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                                        <User size={18} className="text-zinc-400" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-zinc-900 text-sm uppercase tracking-wide">{selectedTicket.landlordName}</span>
                                            <span className="text-[10px] font-bold text-zinc-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="p-5 bg-white border border-zinc-200 rounded-3xl rounded-tl-none shadow-sm text-zinc-700 text-sm leading-relaxed">
                                            {selectedTicket.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedTicket.replies.map(reply => (
                                    <div key={reply.id} className={`flex gap-4 ${reply.authorRole === 'support' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${reply.authorRole === 'support' ? 'bg-zinc-900 border-zinc-800 shadow-xl shadow-zinc-200' : 'bg-zinc-100 border-zinc-200'
                                            }`}>
                                            {reply.authorRole === 'support' ? (
                                                <CheckCircle2 size={18} className="text-white" />
                                            ) : (
                                                <User size={18} className="text-zinc-400" />
                                            )}
                                        </div>
                                        <div className={`flex-1 space-y-2 ${reply.authorRole === 'support' ? 'text-right' : ''}`}>
                                            <div className={`flex items-center gap-3 ${reply.authorRole === 'support' ? 'flex-row-reverse' : ''}`}>
                                                <span className={`font-black text-sm uppercase tracking-wide ${reply.authorRole === 'support' ? 'text-indigo-600' : 'text-zinc-900'}`}>{reply.authorName}</span>
                                                <span className="text-[10px] font-bold text-zinc-400">{new Date(reply.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className={`p-5 text-sm leading-relaxed shadow-sm ${reply.authorRole === 'support'
                                                ? 'bg-zinc-900 text-white rounded-3xl rounded-tr-none'
                                                : 'bg-white border border-zinc-200 rounded-3xl rounded-tl-none text-zinc-700'
                                                }`}>
                                                {reply.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            <div className="p-6 border-t border-zinc-100 bg-zinc-50/30">
                                <form
                                    className="relative"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const input = form.elements.namedItem('reply') as HTMLInputElement;
                                        if (input.value.trim() && !replying) {
                                            handleReply(selectedTicket.id, input.value);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    <input
                                        name="reply"
                                        type="text"
                                        placeholder="Type your official response..."
                                        className="w-full pl-6 pr-14 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition shadow-lg shadow-zinc-100"
                                        autoComplete="off"
                                        disabled={replying || selectedTicket.status === 'CLOSED'}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-black transition disabled:opacity-50 shadow-lg shadow-zinc-900/20"
                                        disabled={replying || selectedTicket.status === 'CLOSED'}
                                    >
                                        {replying ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </form>
                                <div className="flex items-center justify-center gap-6 mt-4">
                                    <button
                                        onClick={() => updateStatus(selectedTicket.id, 'RESOLVED')}
                                        className="flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition uppercase tracking-widest"
                                    >
                                        <CheckCircle2 size={14} />
                                        Mark as Resolved
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedTicket.id, 'CLOSED')}
                                        className="flex items-center gap-1.5 text-xs font-black text-zinc-400 hover:text-zinc-600 transition uppercase tracking-widest"
                                    >
                                        <XCircle size={14} />
                                        Close Thread
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <MessageCircle size={64} className="text-zinc-100" />
                            <div className="text-center">
                                <p className="text-zinc-400 font-black text-xs uppercase tracking-[0.2em] mb-1">Support Queue</p>
                                <p className="text-zinc-300 font-bold text-sm">Select a ticket to view conversation</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
