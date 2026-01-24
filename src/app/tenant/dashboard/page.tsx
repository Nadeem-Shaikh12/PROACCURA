'use client';

import { useEffect, useState } from 'react';
import {
    Shield,
    Clock,
    Home,
    BadgeCheck,
    User,
    ArrowUpRight,
    MessageSquare,
    Wrench,
    FileText,
    Bell,
    MapPin,
    Calendar,
    Sparkles,
    Settings,
    X
} from 'lucide-react';
import Link from 'next/link';
import Chatbot from '@/components/dashboard/Chatbot';
import { useAuth } from '@/context/AuthContext';

export default function TenantDashboard() {
    const { user, isLoading } = useAuth();
    const [stay, setStay] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [pendingRequest, setPendingRequest] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
    }, [user, isLoading]);

    const fetchDashboardState = async () => {
        if (!user) return;
        try {
            const [stayRes, notifRes, verifyRes] = await Promise.all([
                fetch('/api/tenant/stay'),
                fetch('/api/notifications'),
                fetch('/api/tenant/verify')
            ]);
            const stayData = await stayRes.json();
            const notifData = await notifRes.json();
            const verifyData = await verifyRes.json();

            setStay(stayData.stay);
            if (notifData.notifications) setNotifications(notifData.notifications.filter((n: any) => !n.isRead));

            if (verifyData.request) {
                setPendingRequest(verifyData.request);
            }
        } catch (e) {
            console.error('Failed to fetch data', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDashboardState();
    }, [user]);

    useEffect(() => {
        if (!user || stay) return;
        const interval = setInterval(() => {
            fetchDashboardState();
        }, 3000);
        return () => clearInterval(interval);
    }, [user, stay]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (isLoading || loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="relative h-24 w-24">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-blue-500 animate-pulse" size={32} />
                </div>
            </div>
            <p className="mt-8 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Portal</p>
        </div>
    );

    if (!stay) {
        if (pendingRequest && pendingRequest.status === 'pending') {
            return (
                <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                    <div className="w-full max-w-xl bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 bg-[length:200%_auto] animate-gradient-x"></div>
                        <div className="h-24 w-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-transform duration-1000">
                            <Clock size={48} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Hang Tight!</h1>
                        <p className="text-slate-500 text-lg mb-10 leading-relaxed font-bold">
                            Your application for <span className="text-blue-600 font-black underline decoration-blue-100 underline-offset-4">{pendingRequest.landlordName || 'the property'}</span> is being carefully reviewed by the landlord.
                        </p>
                        <div className="py-4 px-6 bg-slate-900 rounded-2xl flex items-center justify-center gap-3 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-slate-200">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            Verification in Progress
                        </div>
                    </div>
                    <Chatbot />
                </div>
            );
        }

        if (pendingRequest && pendingRequest.status === 'rejected') {
            return (
                <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                    <div className="w-full max-w-xl bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden group">
                        <div className="h-24 w-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <X size={48} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Status</h1>
                        <p className="text-slate-500 text-lg mb-6 leading-relaxed font-bold">
                            Your application for <span className="text-red-600 font-black">{pendingRequest.landlordName || 'the property'}</span> was not approved.
                        </p>
                        {pendingRequest.remarks && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold mb-10 border border-red-100">
                                Reason: {pendingRequest.remarks}
                            </div>
                        )}
                        <Link href="/tenant/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all">
                            Try Another Property <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <Chatbot />
                </div>
            );
        }

        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
                <div className="mb-12 relative">
                    <div className="h-32 w-32 bg-blue-600 rounded-[2.5rem] rotate-12 flex items-center justify-center shadow-2xl shadow-blue-200">
                        <Home size={64} className="text-white -rotate-12" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100">
                        <BadgeCheck size={32} className="text-emerald-500" />
                    </div>
                </div>
                <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Start Your Journey</h1>
                <p className="text-slate-400 text-xl max-w-md mb-12 leading-relaxed font-bold">Elevate your living experience with Smart Rental's professional verification ecosystem.</p>
                <Link href="/tenant/onboarding" className="group relative px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-slate-200">
                    <span className="relative z-10 flex items-center gap-3">
                        Onboard Now <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
                <Chatbot />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-100/30 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-10">
                {/* Dynamic Header */}
                <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm">
                                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Live System Active</span>
                            </div>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
                            {getGreeting()}, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-lg italic">Your smart residence management at a glance.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
                            <button className="p-3 text-zinc-400 hover:text-zinc-900 transition relative">
                                <Bell size={24} />
                                {notifications.length > 0 && <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                            </button>
                            <Link href="/tenant/dashboard/settings" className="p-3 text-zinc-400 hover:text-zinc-900 transition">
                                <Settings size={24} />
                            </Link>
                        </div>
                        <div className="h-14 w-14 bg-zinc-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-zinc-200">
                            <User className="text-white" size={28} />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                    {/* Left & Middle Column (Grid spanning 3 columns on XL) */}
                    <div className="md:col-span-2 xl:col-span-3 space-y-8">
                        {/* Main Interaction Cards */}
                        <div className="grid grid-cols-1 gap-6">

                            {/* Property Showcase Card */}
                            <div className="w-full relative group overflow-hidden bg-white rounded-[3rem] p-4 border border-slate-200 shadow-xl shadow-slate-200/60 hover:shadow-2xl transition-all duration-500">
                                <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent z-10"></div>
                                    <img
                                        src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200`}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        alt="Home"
                                    />
                                    <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                        <div className="flex items-center gap-2 text-white">
                                            <MapPin size={14} className="text-blue-400" />
                                            <span className="text-xs font-black uppercase tracking-widest">{stay.propertyName}</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6 z-20">
                                        <h3 className="text-2xl font-black text-white mb-1">{stay.propertyName}</h3>
                                        <p className="text-zinc-300 text-sm font-medium flex items-center gap-2">
                                            <MapPin size={14} /> {stay.propertyAddress || 'Lux Residency, Building A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between px-4 pb-4">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Stay Started</p>
                                            <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                                <Calendar size={14} className="text-blue-500" />
                                                {new Date(stay.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                            <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                                <BadgeCheck size={14} className="text-emerald-500" /> Verified
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/tenant/dashboard/history" className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-inner">
                                        <ArrowUpRight size={24} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Action Center */}
                        <div className="grid grid-cols-1 gap-6 lg:gap-8">
                            {/* Action Center - Full Width */}
                            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-8 border border-slate-200 shadow-xl shadow-slate-200/60 flex flex-col h-full">
                                <h3 className="text-lg lg:text-xl font-black text-slate-900 mb-6 lg:mb-8 flex items-center gap-2">
                                    <Sparkles size={20} className="text-blue-500" /> Core Services
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Link href="/tenant/messages" className="p-6 bg-slate-50 rounded-3xl hover:bg-slate-900 hover:text-white transition-all group shadow-sm border border-slate-100">
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/10 shadow-sm border border-slate-100 transition-colors">
                                            <MessageSquare size={24} className="text-blue-500" />
                                        </div>
                                        <div className="font-bold text-sm mb-1 uppercase tracking-wider">Messages</div>
                                        <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest leading-none">Contact Landlord</p>
                                    </Link>
                                    <Link href="/tenant/dashboard/maintenance" className="p-6 bg-slate-50 rounded-3xl hover:bg-slate-900 hover:text-white transition-all group shadow-sm border border-slate-100">
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/10 shadow-sm border border-slate-100 transition-colors">
                                            <Wrench size={24} className="text-orange-500" />
                                        </div>
                                        <div className="font-bold text-sm mb-1 uppercase tracking-wider">Support</div>
                                        <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest leading-none">Maintenance</p>
                                    </Link>
                                    <Link href="/tenant/dashboard/report" className="p-6 bg-slate-50 rounded-3xl hover:bg-slate-900 hover:text-white transition-all group shadow-sm border border-slate-100">
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/10 shadow-sm border border-slate-100 transition-colors">
                                            <FileText size={24} className="text-emerald-500" />
                                        </div>
                                        <div className="font-bold text-sm mb-1 uppercase tracking-wider">Reports</div>
                                        <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest leading-none">Agreements</p>
                                    </Link>
                                    <Link href="/tenant/dashboard/documents" className="p-6 bg-slate-50 rounded-3xl hover:bg-slate-900 hover:text-white transition-all group shadow-sm border border-slate-100">
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/10 shadow-sm border border-slate-100 transition-colors">
                                            <BadgeCheck size={24} className="text-blue-500" />
                                        </div>
                                        <div className="font-bold text-sm mb-1 uppercase tracking-wider">Vault</div>
                                        <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest leading-none">Personal Docs</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: High-End Stats Card */}
                    <div className="md:col-span-2 xl:col-span-1 space-y-6 lg:gap-8">
                        {/* Status Sphere Card */}
                        <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[4rem] border border-slate-200 shadow-xl shadow-slate-200/60 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6 lg:mb-10">Verification Tier</p>

                                <div className="relative inline-flex items-center justify-center p-6 lg:p-8 mb-4 lg:mb-8">
                                    {/* SVG Progress Ring */}
                                    <svg className="w-40 h-40 lg:w-48 lg:h-48 -rotate-90">
                                        <circle cx="80" cy="80" r="72" className="stroke-slate-100 fill-none lg:hidden" strokeWidth="10" />
                                        <circle cx="96" cy="96" r="88" className="stroke-slate-100 fill-none hidden lg:block" strokeWidth="12" />
                                        <circle
                                            cx="80" cy="80" r="72"
                                            className="stroke-blue-600 fill-none transition-all duration-1000 lg:hidden"
                                            strokeWidth="10"
                                            strokeDasharray={2 * Math.PI * 72}
                                            strokeDashoffset={2 * Math.PI * 72 * (1 - (stay.trustScore || 85) / 100)}
                                            strokeLinecap="round"
                                        />
                                        <circle
                                            cx="96" cy="96" r="88"
                                            className="stroke-blue-600 fill-none transition-all duration-1000 hidden lg:block"
                                            strokeWidth="12"
                                            strokeDasharray={2 * Math.PI * 88}
                                            strokeDashoffset={2 * Math.PI * 88 * (1 - (stay.trustScore || 85) / 100)}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900">{stay.trustScore || 85}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Trust Score</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-300">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Current Ranking</p>
                                        <p className="text-lg font-black flex items-center justify-center gap-2">
                                            Elite Resident <Shield size={16} className="text-blue-400" />
                                        </p>
                                    </div>
                                    <p className="text-zinc-500 text-xs font-medium px-4 leading-relaxed">
                                        Your track record is exceptional. Paying rent on time contributes to your global "Smart Score".
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Minimal Card */}
                        <div className="bg-slate-900 rounded-[3rem] p-4 text-white shadow-2xl overflow-hidden relative group">
                            <div className="bg-slate-800 rounded-[2.5rem] p-8 relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {user?.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-black text-lg truncate">{user?.name}</h4>
                                        <p className="text-slate-400 text-[10px] truncate font-black uppercase tracking-widest">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact</span>
                                        <span className="text-xs font-black">{user?.tenantProfile?.mobile || 'Not Set'}</span>
                                    </div>
                                    <div className="px-1 pt-1">
                                        <Link href="/tenant/dashboard/settings" className="block text-center py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Edit Registry</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/20 blur-[80px] -mr-20 -mt-20"></div>
                        </div>
                    </div>
                </div>
            </div>

            <Chatbot />
        </div>
    );
}
