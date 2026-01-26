'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {
    FileText, Calendar, IndianRupee, Clock,
    ArrowUpRight, Download, CheckCircle,
    AlertCircle, Sparkles, Building
} from 'lucide-react';
import Link from 'next/link';

export default function TenantLeasePage() {
    const { user } = useAuth();
    const [stay, setStay] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch('/api/tenant/stay')
                .then(res => res.json())
                .then(data => setStay(data.stay))
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-indigo-600 rounded-full border-t-transparent" /></div>;

    if (!stay) return (
        <div className="p-8 text-center pt-20">
            <h2 className="text-xl font-bold">No Active Lease Found</h2>
            <Link href="/tenant/onboarding" className="text-indigo-600 hover:underline mt-2 inline-block">Start Verification</Link>
        </div>
    );

    const startDate = new Date(stay.joinDate || Date.now());
    // Default to 11 months if no end date
    const endDate = stay.moveOutDate ? new Date(stay.moveOutDate) : new Date(startDate.getTime() + 11 * 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100));

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                        <FileText size={24} />
                    </div>
                    Lease Agreement
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">Manage your residency terms and documents.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Key Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle size={12} /> Active Lease
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900">{stay.propertyName}</h2>
                                <p className="text-zinc-500 font-medium flex items-center gap-2 mt-1">
                                    <Building size={16} /> Unit {stay.unitId || 'A-101'}
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-1">Monthly Rent</p>
                                <p className="text-3xl font-black text-zinc-900">₹{(stay.rentAmount || stay.monthlyRent || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-10">
                            <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
                                <span>Start: {startDate.toLocaleDateString()}</span>
                                <span>End: {endDate.toLocaleDateString()}</span>
                            </div>
                            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-center mt-3 text-xs font-bold text-indigo-600">
                                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Lease Expired'}
                            </p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <IndianRupee size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Security Deposit</p>
                                <p className="text-xl font-black text-zinc-900">₹1,00,000</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Next Renewal</p>
                                <p className="text-xl font-black text-zinc-900">{endDate.toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Terms / Clauses Placeholder */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200">
                        <h3 className="text-lg font-black text-zinc-900 mb-6">Lease Terms Highlights</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-indigo-600 mt-0.5" />
                                <span className="text-sm font-medium text-zinc-600">Rent is due on the 1st of every month. Late fee applies after the 5th.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-indigo-600 mt-0.5" />
                                <span className="text-sm font-medium text-zinc-600">Maintenance requests must be submitted through the portal 24h in advance for non-emergencies.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-indigo-600 mt-0.5" />
                                <span className="text-sm font-medium text-zinc-600">Subletting is not permitted without written consent from the landlord.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Documents & Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2">Documents</h3>
                            <p className="text-slate-400 text-sm mb-6">Official copies of your agreement.</p>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition backdrop-blur-sm border border-white/10 group">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-indigo-400" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Signed Lease.pdf</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">2.4 MB • {startDate.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Download size={18} className="opacity-50 group-hover:opacity-100" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition backdrop-blur-sm border border-white/10 group">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-indigo-400" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">House Rules.pdf</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">1.1 MB</p>
                                        </div>
                                    </div>
                                    <Download size={18} className="opacity-50 group-hover:opacity-100" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {daysLeft < 60 && (
                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center">
                            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertCircle size={24} />
                            </div>
                            <h4 className="font-black text-amber-900 mb-1">Lease Ending Soon</h4>
                            <p className="text-xs font-bold text-amber-700 mb-4">You can request renewal now.</p>
                            <button className="w-full py-3 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-200 hover:bg-amber-600 transition">
                                Request Renewal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
