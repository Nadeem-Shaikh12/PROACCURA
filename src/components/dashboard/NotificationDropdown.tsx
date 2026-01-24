'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Zap, Info, CreditCard, ChevronRight, CalendarX } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'MONTH_COMPLETED' | 'NEW_BILL_CYCLE' | 'PAYMENT_PENDING' | 'PAYMENT_RECEIVED' | 'REMARK_ADDED';
    isRead: boolean;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (e) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Polling every 2 minutes or just on mount for now
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error('Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markAllRead' })
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error('Failed to mark all as read');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'MONTH_COMPLETED': return <Check className="text-emerald-500" size={16} />;
            case 'NEW_BILL_CYCLE': return <Zap className="text-amber-500" size={16} />;
            case 'PAYMENT_PENDING': return <CreditCard className="text-red-500" size={16} />;
            case 'PAYMENT_RECEIVED': return <Check className="text-indigo-500" size={16} />;
            case 'REMARK_ADDED': return <Info className="text-blue-500" size={16} />;
            case 'LEASE_EXPIRY': return <CalendarX className="text-rose-500" size={16} />;
            default: return <Bell className="text-zinc-500" size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                        <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded-full text-[10px]">{unreadCount} New</span>}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" size={32} />
                                <p className="text-sm text-zinc-500">No notifications yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                        className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer flex gap-4 ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">
                                                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-500'}`}>
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-800/50">
                        <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 font-medium flex items-center justify-center gap-1 mx-auto">
                            View all activity <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
