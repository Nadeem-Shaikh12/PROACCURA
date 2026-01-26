'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle2, Save, Loader2 } from 'lucide-react';

export default function NotificationSettingsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        email: {
            maintenance: true,
            payments: true,
            documents: true,
            marketing: false
        },
        push: {
            messages: true,
            requests: true,
            reminders: false
        }
    });

    useEffect(() => {
        if (user?.notificationPreferences) {
            setPreferences({
                email: user.notificationPreferences.email || {
                    maintenance: true,
                    payments: true,
                    documents: true,
                    marketing: false
                },
                push: user.notificationPreferences.push || {
                    messages: true,
                    requests: true,
                    reminders: false
                }
            });
        }
    }, [user]);

    const toggleEmail = (key: keyof typeof preferences.email) => {
        setPreferences(prev => ({
            ...prev,
            email: { ...prev.email, [key]: !prev.email[key] }
        }));
    };

    const togglePush = (key: keyof typeof preferences.push) => {
        setPreferences(prev => ({
            ...prev,
            push: { ...prev.push, [key]: !prev.push[key] }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationPreferences: preferences })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Notification preferences saved!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Notification Preferences</h1>
                <p className="text-zinc-500">Choose how you want to be notified about activity.</p>
            </div>

            {/* Email Notifications */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                        <Mail size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900">Email Notifications</h3>
                        <p className="text-xs text-zinc-500">Receive updates directly to your inbox</p>
                    </div>
                </div>
                <div className="divide-y divide-zinc-100">
                    <ToggleItem
                        title="Maintenance Requests"
                        desc="Get notified when a tenant submits a new work order."
                        checked={preferences.email.maintenance}
                        onChange={() => toggleEmail('maintenance')}
                    />
                    <ToggleItem
                        title="Rent Payments"
                        desc="Receive confirmation when rent payments are successfully processed."
                        checked={preferences.email.payments}
                        onChange={() => toggleEmail('payments')}
                    />
                    <ToggleItem
                        title="Document Signatures"
                        desc="Alerts when a lease or addendum is signed by a tenant."
                        checked={preferences.email.documents}
                        onChange={() => toggleEmail('documents')}
                    />
                    <ToggleItem
                        title="Platform Updates & Tips"
                        desc="Occasional emails about new features and property management tips."
                        checked={preferences.email.marketing}
                        onChange={() => toggleEmail('marketing')}
                    />
                </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                        <Bell size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900">Push Notifications</h3>
                        <p className="text-xs text-zinc-500">Real-time alerts in the browser/app</p>
                    </div>
                </div>
                <div className="divide-y divide-zinc-100">
                    <ToggleItem
                        title="New Messages"
                        desc="Instant alerts when a tenant sends you a message."
                        checked={preferences.push.messages}
                        onChange={() => togglePush('messages')}
                    />
                    <ToggleItem
                        title="Urgent Requests"
                        desc="High-priority alerts for emergency maintenance issues."
                        checked={preferences.push.requests}
                        onChange={() => togglePush('requests')}
                    />
                    <ToggleItem
                        title="Daily Summary"
                        desc="A morning notification summarizing pending tasks (if any)."
                        checked={preferences.push.reminders}
                        onChange={() => togglePush('reminders')}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Preferences
                </button>
            </div>
        </div>
    );
}

function ToggleItem({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50/50 transition">
            <div className="pr-4">
                <p className="font-medium text-zinc-900">{title}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{desc}</p>
            </div>
            <button
                onClick={onChange}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 shrink-0 ${checked ? 'bg-zinc-900' : 'bg-zinc-200'}`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ease-in-out mt-1 ml-1 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        </div>
    );
}
