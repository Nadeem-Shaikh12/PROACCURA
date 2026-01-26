'use client';

import { useState, useEffect } from 'react';
import {
    HelpCircle,
    MessageCircle,
    FileText,
    Search,
    Plus,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Send,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SupportArticle, SupportTicket } from '@/lib/types';

type Tab = 'KNOWLEDGE_BASE' | 'MY_TICKETS' | 'NEW_TICKET';

export default function SupportPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('KNOWLEDGE_BASE');
    const [articles, setArticles] = useState<SupportArticle[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<SupportArticle | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);

    // New Ticket Form
    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'TECHNICAL',
        description: '',
        priority: 'NORMAL'
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [kbRes, ticketsRes] = await Promise.all([
                    fetch('/api/support/kb'),
                    fetch(`/api/support/tickets?landlordId=${user?.id}`)
                ]);
                const kbData = await kbRes.json();
                const ticketsData = await ticketsRes.json();
                setArticles(Array.isArray(kbData) ? kbData : []);
                setTickets(Array.isArray(ticketsData) ? ticketsData : []);
            } catch (err) {
                console.error('Error loading support data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchData();
    }, [user?.id]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTicket, landlordId: user?.id })
            });
            if (res.ok) {
                const ticket = await res.json();
                setTickets([ticket, ...tickets]);
                setActiveTab('MY_TICKETS');
                setNewTicket({ subject: '', category: 'TECHNICAL', description: '', priority: 'NORMAL' });
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (ticketId: string, content: string) => {
        try {
            const res = await fetch(`/api/support/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    authorId: user?.id,
                    authorName: user?.name
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedTicket(updated);
                setTickets(tickets.map(t => t.id === ticketId ? updated : t));
            }
        } catch (err) {
            console.error('Error replying to ticket:', err);
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Help & Support</h1>
                    <p className="text-zinc-500">Need help? Browse our guides or talk to our team.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-lg self-start">
                    <button
                        onClick={() => { setActiveTab('KNOWLEDGE_BASE'); setSelectedArticle(null); }}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'KNOWLEDGE_BASE' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        KB & Documentation
                    </button>
                    <button
                        onClick={() => { setActiveTab('MY_TICKETS'); setSelectedTicket(null); }}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'MY_TICKETS' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        My Tickets ({tickets.length})
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: KNOWLEDGE BASE */}
            {activeTab === 'KNOWLEDGE_BASE' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {!selectedArticle ? (
                        <>
                            {/* Search bar */}
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for articles, guides, and how-tos..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition shadow-sm hover:shadow-md"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* KB Content */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        <FileText size={18} className="text-indigo-500" />
                                        Popular Articles
                                    </h3>
                                    <div className="grid gap-3">
                                        {filteredArticles.length > 0 ? filteredArticles.map(article => (
                                            <button
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article)}
                                                className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-900 hover:shadow-md transition text-left group"
                                            >
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1 block">
                                                        {article.category}
                                                    </span>
                                                    <h4 className="font-semibold text-zinc-900">{article.title}</h4>
                                                </div>
                                                <ChevronRight className="text-zinc-300 group-hover:text-zinc-900 transition" size={20} />
                                            </button>
                                        )) : (
                                            <div className="p-12 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                                <p className="text-zinc-500">No articles found matching your search.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-zinc-900 text-white rounded-2xl shadow-xl overflow-hidden relative">
                                        <div className="relative z-10">
                                            <h3 className="font-bold text-lg mb-2">Still Stuck?</h3>
                                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                                If you can't find what you're looking for, open a ticket and our team will help you out.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('NEW_TICKET')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-zinc-900 font-bold rounded-lg hover:bg-zinc-100 transition shadow-lg shadow-white/10"
                                            >
                                                <Plus size={18} />
                                                New Ticket
                                            </button>
                                        </div>
                                        <HelpCircle className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
                                    </div>

                                    <div className="p-6 bg-white border border-zinc-200 rounded-2xl">
                                        <h3 className="font-bold text-zinc-900 mb-4">Quick Links</h3>
                                        <ul className="space-y-3">
                                            {['Payments Guide', 'Tenant Onboarding', 'Messaging Setup', 'Profile Security'].map(link => (
                                                <li key={link}>
                                                    <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center justify-between group">
                                                        {link}
                                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-8 space-y-6 animate-in fade-in zoom-in-95">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-4 transition text-sm font-medium"
                            >
                                <ArrowLeft size={16} />
                                Back to resources
                            </button>
                            <div>
                                <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                                    {selectedArticle.category}
                                </span>
                                <h2 className="text-3xl font-bold text-zinc-900">{selectedArticle.title}</h2>
                                <p className="text-zinc-400 text-sm mt-2">Last updated {new Date(selectedArticle.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed border-t border-zinc-100 pt-6">
                                {selectedArticle.content}
                            </div>
                            <div className="border-t border-zinc-100 pt-8 mt-12 flex flex-col items-center gap-4 text-center">
                                <h4 className="font-bold text-zinc-900">Was this article helpful?</h4>
                                <div className="flex gap-3">
                                    <button className="px-6 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition text-sm font-medium">Yes, thanks!</button>
                                    <button className="px-6 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition text-sm font-medium">Not really</button>
                                </div>
                                <p className="text-zinc-400 text-xs mt-2">{selectedArticle.helpfulCount} people found this helpful</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: MY TICKETS */}
            {activeTab === 'MY_TICKETS' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {!selectedTicket ? (
                        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                            {tickets.length > 0 ? (
                                <div className="divide-y divide-zinc-100">
                                    {tickets.map(ticket => (
                                        <button
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 transition text-left group"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-zinc-400">{ticket.id}</span>
                                                    <h4 className="font-bold text-zinc-900">{ticket.subject}</h4>
                                                </div>
                                                <div className="flex items-center gap-4 text-[12px] text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-1 uppercase tracking-wider font-bold text-[10px]">
                                                        {ticket.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-indigo-50 text-indigo-600' :
                                                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                                                            ticket.status === 'AWAITING_REPLY' ? 'bg-rose-50 text-rose-600 font-black ring-1 ring-rose-200 animate-pulse' :
                                                                'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {ticket.replies.length} replies
                                                    </span>
                                                </div>
                                                <ChevronRight className="text-zinc-300 group-hover:text-zinc-900 transition" size={18} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                                        <MessageCircle className="text-zinc-300" size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-zinc-900">No support tickets yet</h3>
                                        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                                            When you open a support ticket, it will appear here. You can track status and reply to threads.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('NEW_TICKET')}
                                        className="mt-4 px-6 py-2 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition shadow-lg"
                                    >
                                        Create First Ticket
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 flex flex-col h-[700px]">
                            {/* Ticket Header */}
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="p-2 hover:bg-white rounded-lg transition text-zinc-500 hover:text-zinc-900 border border-transparent hover:border-zinc-200"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-zinc-400">{selectedTicket.id}</span>
                                            <h3 className="font-bold text-zinc-900">{selectedTicket.subject}</h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                                            <span className="capitalize">{selectedTicket.category.toLowerCase()} Issue</span>
                                            <span>•</span>
                                            <span className={`${selectedTicket.priority === 'HIGH' ? 'text-rose-500' :
                                                selectedTicket.priority === 'NORMAL' ? 'text-amber-500' : 'text-zinc-400'
                                                } font-bold uppercase tracking-widest text-[9px]`}>{selectedTicket.priority} Priority</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedTicket.status === 'OPEN' ? 'bg-indigo-50 text-indigo-600' :
                                    selectedTicket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                                        'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {selectedTicket.status.replace('_', ' ')}
                                </div>
                            </div>

                            {/* Ticket Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                                {/* Original Message */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-zinc-400">{user?.name[0]}</span>
                                    </div>
                                    <div className="space-y-1.5 flex-1 max-w-[85%]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 text-sm">{user?.name}</span>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">LAndlord</span>
                                            <span className="text-[10px] text-zinc-400">• {new Date(selectedTicket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="p-4 bg-zinc-50 rounded-2xl rounded-tl-none border border-zinc-100 text-zinc-600 text-sm leading-relaxed">
                                            {selectedTicket.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedTicket.replies.map(reply => (
                                    <div key={reply.id} className={`flex gap-4 ${reply.authorRole === 'support' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${reply.authorRole === 'support' ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                                            <span className={`font-bold ${reply.authorRole === 'support' ? 'text-white' : 'text-zinc-400'}`}>
                                                {reply.authorName[0]}
                                            </span>
                                        </div>
                                        <div className={`space-y-1.5 flex-1 max-w-[85%] ${reply.authorRole === 'support' ? 'text-right' : ''}`}>
                                            <div className={`flex items-center gap-2 ${reply.authorRole === 'support' ? 'flex-row-reverse' : ''}`}>
                                                <span className="font-bold text-zinc-900 text-sm">{reply.authorName}</span>
                                                <span className={`text-[10px] uppercase tracking-wider font-bold ${reply.authorRole === 'support' ? 'text-indigo-500' : 'text-zinc-400'}`}>
                                                    {reply.authorRole}
                                                </span>
                                                <span className="text-[10px] text-zinc-300">• {new Date(reply.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                            </div>
                                            <div className={`p-4 text-sm leading-relaxed ${reply.authorRole === 'support'
                                                ? 'bg-zinc-900 text-white rounded-2xl rounded-tr-none'
                                                : 'bg-zinc-50 text-zinc-600 rounded-2xl rounded-tl-none border border-zinc-100'
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
                                        if (input.value.trim()) {
                                            handleReply(selectedTicket.id, input.value);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    <input
                                        name="reply"
                                        type="text"
                                        placeholder="Type your message here..."
                                        className="w-full pl-6 pr-14 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition shadow-sm"
                                        disabled={selectedTicket.status === 'CLOSED'}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={selectedTicket.status === 'CLOSED'}
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                                {selectedTicket.status === 'CLOSED' && (
                                    <p className="text-center text-xs text-zinc-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        This ticket has been resolved and closed.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: NEW TICKET */}
            {activeTab === 'NEW_TICKET' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">Submit a New Ticket</h3>
                                <p className="text-sm text-zinc-500 mt-1">Tell us more about the issue you're facing.</p>
                            </div>
                            <HelpCircle className="text-zinc-200 w-12 h-12" />
                        </div>
                        <form className="p-8 space-y-6" onSubmit={handleCreateTicket}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Category</label>
                                    <select
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                    >
                                        <option value="TECHNICAL">Technical Issue</option>
                                        <option value="BILLING">Billing & Payments</option>
                                        <option value="ACCOUNT">Account Settings</option>
                                        <option value="FEATURE_REQUEST">Feature Request</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Priority Level</label>
                                    <select
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition font-medium"
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                    >
                                        <option value="LOW" className="text-zinc-400 font-bold">○ LOW</option>
                                        <option value="NORMAL" className="text-amber-600 font-bold">◍ NORMAL</option>
                                        <option value="HIGH" className="text-rose-600 font-bold">● HIGH</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Briefly summarize the problem"
                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                                    required
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Description</label>
                                <textarea
                                    rows={5}
                                    placeholder="Provide as much detail as possible. What happened? What did you expect?"
                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition resize-none"
                                    required
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('MY_TICKETS')}
                                    className="px-6 py-2.5 text-zinc-500 font-bold rounded-xl hover:text-zinc-900 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shadow-zinc-900/10 active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Submit Ticket
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-4">
                        <AlertCircle className="text-indigo-500 shrink-0" size={24} />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-indigo-900">Pro Tip</h4>
                            <p className="text-sm text-indigo-700/70 leading-relaxed">
                                Attaching a screenshot of the issue helps our technical team resolve your problem up to 2x faster. You can paste images directly into the description or use our chat later!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
