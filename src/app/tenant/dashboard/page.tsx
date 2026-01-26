'use client';

import { useEffect, useState } from 'react';
import {
    MapPin,
    Calendar,
    BadgeCheck,
    Sparkles,
    Bell,
    Settings,
    User,
    ArrowUpRight,
    Clock,
    X,
    Home
} from 'lucide-react';
import Link from 'next/link';
import Chatbot from '@/components/dashboard/Chatbot';
import CommunityBoardWidget from '@/components/dashboard/CommunityBoardWidget';
import RentSnapshotWidget from '@/components/dashboard/widgets/RentSnapshotWidget';
import MaintenancePreviewWidget from '@/components/dashboard/widgets/MaintenancePreviewWidget';
import QuickLinksWidget from '@/components/dashboard/widgets/QuickLinksWidget';
import ActivityFeedWidget from '@/components/dashboard/widgets/ActivityFeedWidget';
import DocumentsWidget from '@/components/dashboard/widgets/DocumentsWidget';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function TenantDashboard() {
    const { user, isLoading } = useAuth();
    const [stay, setStay] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [pendingRequest, setPendingRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { t } = useLanguage();

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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('greeting.morning');
        if (hour < 18) return t('greeting.afternoon');
        return t('greeting.evening');
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
            <p className="mt-8 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Control Center</p>
        </div>
    );

    // Handle Non-Active States (Pending/Rejected)
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
                        <Home size={64} className="text-white" style={{ transform: 'rotate(-12deg)' }} />
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
        <div className="min-h-screen pb-20 p-6 md:p-12 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Control Center</span>
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-none">
                        {getGreeting()}, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-lg italic flex items-center gap-2">
                        <MapPin size={16} /> {stay.propertyName}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
                        <Link href="/tenant/dashboard/notifications" className="p-3 text-zinc-400 hover:text-zinc-900 transition relative">
                            <Bell size={24} />
                            {notifications.length > 0 && <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                        </Link>
                        <Link href="/tenant/dashboard/settings" className="p-3 text-zinc-400 hover:text-zinc-900 transition">
                            <Settings size={24} />
                        </Link>
                    </div>
                    <div className="h-14 w-14 bg-zinc-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-zinc-200">
                        <User className="text-white" size={28} />
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

                {/* Row 1: Left - Rent Snapshot (4 cols) */}
                <div className="md:col-span-4 xl:col-span-3">
                    <RentSnapshotWidget userId={user!.id} />
                </div>

                {/* Row 1: Middle - Lease/Property Overview (5 cols) */}
                <div className="md:col-span-8 xl:col-span-6">
                    <div className="w-full h-full relative group overflow-hidden bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-xl shadow-slate-200/60 hover:shadow-2xl transition-all duration-500">
                        <div className="relative h-full w-full rounded-[2rem] overflow-hidden min-h-[250px]">
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/30 to-transparent z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                alt="Home"
                            />

                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <h3 className="text-3xl font-bold text-white mb-2">{stay.propertyName}</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold text-white flex items-center gap-2">
                                        <Calendar size={14} /> Since {new Date(stay.joinDate).getFullYear()}
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-lg text-xs font-bold text-emerald-300 flex items-center gap-2 border border-emerald-500/30">
                                        <BadgeCheck size={14} /> Verified Resident
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 1: Right - Quick Links (3 cols) */}
                <div className="md:col-span-12 xl:col-span-3">
                    <QuickLinksWidget />
                </div>


                {/* Row 2: Left - Maintenance (4) */}
                <div className="md:col-span-6 xl:col-span-4 h-full">
                    <MaintenancePreviewWidget userId={user!.id} />
                </div>

                {/* Row 2: Middle - Documents (4) */}
                <div className="md:col-span-6 xl:col-span-4 h-full">
                    <DocumentsWidget userId={user!.id} />
                </div>

                {/* Row 2: Right - Community (4) */}
                <div className="md:col-span-12 xl:col-span-4 h-full">
                    <CommunityBoardWidget />
                </div>

                {/* Row 3: Full Width - Activity Feed */}
                <div className="md:col-span-12">
                    <ActivityFeedWidget userId={user!.id} />
                </div>

            </div>

            <Chatbot />
        </div>
    );
}
