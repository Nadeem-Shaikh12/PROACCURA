'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Globe, Clock, Save, Loader2 } from 'lucide-react';

export default function LocalizationSettingsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        language: 'en-US',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata'
    });

    useEffect(() => {
        if (user) {
            setSettings({
                language: user.language || 'en-US',
                dateFormat: user.dateFormat || 'DD/MM/YYYY',
                timezone: user.timezone || 'Asia/Kolkata'
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Localization updated!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update localization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Language & Locale</h1>
                <p className="text-zinc-500">Customize formats for dates, time, and text.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                            <Globe size={16} /> Language
                        </label>
                        <select
                            name="language"
                            value={settings.language}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="en-IN">English (India)</option>
                            <option value="hi-IN">Hindi (हिंदी)</option>
                            <option value="es-ES">Spanish (Español)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                            <Clock size={16} /> Time Zone
                        </label>
                        <select
                            name="timezone"
                            value={settings.timezone}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                            <option value="Asia/Kolkata">India Standard Time (IST) - Kolkata</option>
                            <option value="GMT">Greenwich Mean Time (GMT)</option>
                            <option value="America/New_York">Eastern Time (ET) - New York</option>
                            <option value="UTC">Coordinated Universal Time (UTC)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Date Format</label>
                        <select
                            name="dateFormat"
                            value={settings.dateFormat}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY (26/01/2026)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (01/26/2026)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-26)</option>
                            <option value="Do MMM YYYY">Do MMM YYYY (26th Jan 2026)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
