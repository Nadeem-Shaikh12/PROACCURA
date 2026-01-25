'use client';

import { useState } from 'react';
import {
    Search,
    HelpCircle,
    MessageCircle,
    Phone,
    ChevronDown,
    ChevronUp,
    FileText,
    Wrench,
    CreditCard,
    Shield,
    ArrowRight,
    ExternalLink,
    PlayCircle
} from 'lucide-react';
import Link from 'next/link';

// Move static data outside component to avoid recreation
const FAQS = [
    {
        category: 'Payments',
        icon: CreditCard,
        color: 'text-violet-500',
        bg: 'bg-violet-50',
        items: [
            { q: 'How do I pay my rent?', a: 'You can pay rent directly through the "Payments" tab using UPI, Credit Card, or Bank Transfer. Receipts are generated instantly.' },
            { q: 'Is there a late fee?', a: 'Yes, a late fee may apply if payment is not received by the due date specified in your lease agreement.' },
            { q: 'Where can I see my payment history?', a: 'All past transactions and receipts are available in the "Payments" section under "History".' }
        ]
    },
    {
        category: 'Maintenance',
        icon: Wrench,
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        items: [
            { q: 'How do I report a repair issue?', a: 'Go to the "Maintenance" tab and click "New Request". You can describe the issue and attach photos.' },
            { q: 'What is considered an emergency?', a: 'Issues like major water leaks, electrical sparking, or gas leaks are emergencies. Please call the emergency line immediately.' },
            { q: 'Can I track my request status?', a: 'Yes, you will receive real-time updates on the status of your request in the Maintenance section.' }
        ]
    },
    {
        category: 'Lease & Account',
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        items: [
            { q: 'How do I renew my lease?', a: 'Renewal offers will appear in your dashboard 60 days before expiration. You can review and sign digitally.' },
            { q: 'Can I update my contact info?', a: 'Yes, go to Settings > Personal Details to update your phone number or email address.' },
            { q: 'How do I download my lease agreement?', a: 'Your signed lease is always available in the "Documents" or "Vault" section.' }
        ]
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(prev => (prev === index ? null : index));
    };

    return (
        <div className="min-h-screen pb-20 p-6 md:p-12 max-w-[1600px] mx-auto space-y-8">
            <header className="space-y-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Help Center</h1>
                <p className="text-slate-400 font-bold text-lg max-w-2xl">
                    Find answers, contact support, or manage your requests. We're here to help.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold shadow-sm transition"
                        placeholder="Search for help (e.g. 'rent', 'wifi', 'keys')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: FAQs */}
                <div className="xl:col-span-2 space-y-8">
                    {FAQS.map((section, sIdx) => (
                        <div key={sIdx} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`h-12 w-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center`}>
                                    <section.icon size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{section.category}</h2>
                            </div>
                            <div className="space-y-4">
                                {section.items.map((item, idx) => {
                                    const globalIdx = sIdx * 10 + idx;
                                    const isOpen = openFaq === globalIdx;

                                    // Simple search filter
                                    if (searchQuery && !item.q.toLowerCase().includes(searchQuery.toLowerCase()) && !item.a.toLowerCase().includes(searchQuery.toLowerCase())) {
                                        return null;
                                    }

                                    return (
                                        <div key={globalIdx} className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-300 transition relative">
                                            <button
                                                type="button"
                                                onClick={() => toggleFaq(globalIdx)}
                                                className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-slate-50 transition cursor-pointer relative z-10"
                                            >
                                                <span className="font-bold text-slate-700">{item.q}</span>
                                                {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                            </button>

                                            {isOpen && (
                                                <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="pt-2">
                                                        {item.a}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Contact & Actions */}
                <div className="space-y-6">
                    {/* Contact Card */}
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Need Support?</h3>
                            <p className="text-slate-400 text-sm mb-8 font-medium">Contact your landlord directly or raise a ticket.</p>

                            <div className="space-y-4">
                                <Link
                                    href="/tenant/messages"
                                    className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition border border-white/5 group-hover:border-white/10"
                                >
                                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <MessageCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Message Landlord</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">Avg. reply 1 hr</div>
                                    </div>
                                    <ArrowRight size={16} className="ml-auto text-slate-500" />
                                </Link>

                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 opacity-75">
                                    <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Phone size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Emergency Info</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">+91 98765 43210</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Action */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-rose-500" /> Raise a Ticket
                        </h3>
                        <p className="text-slate-500 text-sm mb-6 font-medium">For maintenance, complaints, or specific requests, create a formal ticket.</p>
                        <Link
                            href="/tenant/dashboard/maintenance"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition"
                        >
                            Create Ticket <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Resources */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] p-8 border border-blue-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <HelpCircle size={20} className="text-blue-600" /> Resources
                        </h3>
                        <div className="space-y-3">
                            <Link href="#" className="flex items-center gap-3 p-3 bg-white rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:shadow-md transition group">
                                <FileText size={16} className="text-slate-400 group-hover:text-blue-500" /> User Guide
                                <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                            </Link>
                            <Link href="#" className="flex items-center gap-3 p-3 bg-white rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:shadow-md transition group">
                                <PlayCircle size={16} className="text-slate-400 group-hover:text-blue-500" /> Video Tutorials
                                <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                            </Link>
                            <Link href="#" className="flex items-center gap-3 p-3 bg-white rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:shadow-md transition group">
                                <Shield size={16} className="text-slate-400 group-hover:text-blue-500" /> Tenant Rights
                                <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
