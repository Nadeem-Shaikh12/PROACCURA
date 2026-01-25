'use client';

import { useEffect, useState } from 'react';
import { Bell, ArrowLeft, CheckCircle, Info, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPage() {
    const { user, isLoading } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) {
            fetchNotifications();
        }
    }, [user, isLoading]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                // Mark all as read
                if (data.notifications.some((n: any) => !n.isRead)) {
                    await fetch('/api/notifications', { method: 'PUT' });
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'NEW_BILL_CYCLE': return <CreditCard className="text-indigo-600" size={20} />;
            case 'PAYMENT_RECEIVED': return <CheckCircle className="text-emerald-600" size={20} />;
            case 'REMARK_ADDED': return <Info className="text-blue-600" size={20} />;
            case 'MESSAGE': return <MessageSquare className="text-violet-600" size={20} />;
            default: return <Bell className="text-zinc-600" size={20} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'NEW_BILL_CYCLE': return 'bg-indigo-50';
            case 'PAYMENT_RECEIVED': return 'bg-emerald-50';
            case 'REMARK_ADDED': return 'bg-blue-50';
            case 'MESSAGE': return 'bg-violet-50';
            default: return 'bg-zinc-50';
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading notifications...</div>;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
            <header className="mb-8">
                <Link href="/tenant/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-4 transition">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 text-white p-3 rounded-2xl shadow-lg shadow-zinc-200">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Notifications</h1>
                        <p className="text-zinc-500 text-sm font-medium">Updates, alerts, and reminders.</p>
                    </div>
                </div>
            </header>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
                        <div className="h-20 w-20 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">All Quiet</h3>
                        <p className="text-zinc-500 mt-1">You have no new notifications.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-6 rounded-3xl border transition-all ${notif.isRead ? 'bg-white border-zinc-100 opacity-70 hover:opacity-100' : 'bg-white border-indigo-100 shadow-md shadow-indigo-50/50'}`}
                        >
                            <div className="flex gap-5">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold text-zinc-900 ${!notif.isRead && 'text-indigo-900'}`}>{notif.title}</h3>
                                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 text-sm leading-relaxed">{notif.message}</p>

                                    {notif.type === 'NEW_BILL_CYCLE' && (
                                        <div className="mt-4">
                                            <Link href="/tenant/dashboard/bills" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition">
                                                View Bill <ArrowLeft className="rotate-180" size={14} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
