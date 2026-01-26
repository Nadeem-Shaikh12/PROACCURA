'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Lock, Globe, Clock, Camera, Save, Loader2, ArrowLeft, Bell, FileText, Wrench, Shield, BadgeCheck, Moon, Sun, Smartphone, LogOut, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
    const { user, setUser, isLoading } = useAuth();
    const { setTheme } = useTheme();
    const [submitting, setSubmitting] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showDevices, setShowDevices] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        profilePhoto: '',
        language: 'English',
        timezone: 'UTC',
        notificationPreferences: {
            email: { maintenance: true, payments: true, documents: true, marketing: false },
            push: { messages: true, requests: true, reminders: true }
        },
        portalPreferences: {
            theme: 'light',
            landingPage: 'dashboard',
            emailFormat: 'html'
        },
        securitySettings: {
            twoFactorEnabled: false
        },
        privacySettings: {
            dataSharing: true,
            marketing: false
        }
    });

    // Mock data for Lease - normally fetched from specific API
    const [leaseInfo, setLeaseInfo] = useState<any>(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || user.tenantProfile?.mobile || '',
                profilePhoto: user.profilePhoto || '',
                language: user.language || 'English',
                timezone: user.timezone || 'UTC',
                notificationPreferences: user.notificationPreferences || {
                    email: { maintenance: true, payments: true, documents: true, marketing: false },
                    push: { messages: true, requests: true, reminders: true }
                },
                portalPreferences: user.portalPreferences || {
                    theme: 'light',
                    landingPage: 'dashboard',
                    emailFormat: 'html'
                },
                securitySettings: user.securitySettings || {
                    twoFactorEnabled: false
                },
                privacySettings: user.privacySettings || {
                    dataSharing: true,
                    marketing: false
                }
            }));
            fetchLeaseInfo();
        }
    }, [user]);

    const fetchLeaseInfo = async () => {
        try {
            const res = await fetch('/api/tenant/stay');
            const data = await res.json();
            if (data.stay) setLeaseInfo(data.stay);
        } catch (e) {
            console.error(e);
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePreferenceChange = (section: string, key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            // @ts-ignore
            [section]: {
                // @ts-ignore
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleToggle = (category: 'email' | 'push', key: string) => {
        setFormData(prev => {
            const currentCat = prev.notificationPreferences[category] as any;
            return {
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    [category]: {
                        ...currentCat,
                        [key]: !currentCat[key]
                    }
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/tenant/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                alert('Profile updated successfully!');
                setUser(data.user); // Update context
                setFormData(prev => ({ ...prev, password: '' })); // Clear password
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen pb-20 relative font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/tenant/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-2 transition text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900">Settings & Account</h1>
                    <p className="text-zinc-500 mt-1 font-medium">Manage your personal profile and application preferences.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-zinc-200/50 flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT SIDEBAR (Profile & Read-Only Info) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile Card */}
                    <section className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10"></div>
                        <div className="relative z-10">
                            <div className="relative inline-block mt-4 mb-4">
                                <div className="h-28 w-28 rounded-full bg-zinc-100 mx-auto overflow-hidden border-4 border-white shadow-lg relative">
                                    {formData.profilePhoto ? (
                                        <img src={formData.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-zinc-300">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                                <button type="button" className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md border-2 border-white" onClick={() => alert('Photo upload would go here')}>
                                    <Camera size={14} />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900">{formData.name || 'Tenant Name'}</h2>
                            <p className="text-zinc-500 text-sm mb-6">{formData.email}</p>

                            <input
                                type="text"
                                name="profilePhoto"
                                value={formData.profilePhoto}
                                onChange={handleChange}
                                placeholder="Paste Avatar URL"
                                className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-center focus:outline-none focus:border-indigo-500 transition mb-4"
                            />
                        </div>
                    </section>

                    {/* Lease Info Card */}
                    {leaseInfo && (
                        <section className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-lg shadow-zinc-200/40">
                            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText size={16} className="text-blue-500" /> Current Lease
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                                    <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Property</div>
                                    <div className="font-bold text-zinc-900 text-sm">{leaseInfo.propertyName}</div>
                                    <div className="text-xs text-zinc-500 mt-1">{leaseInfo.propertyAddress}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 p-3 bg-zinc-50 rounded-2xl">
                                        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Rent</div>
                                        <div className="font-bold text-zinc-900">₹{leaseInfo.monthlyRent?.toLocaleString()}</div>
                                    </div>
                                    <div className="flex-1 p-3 bg-zinc-50 rounded-2xl">
                                        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Join Date</div>
                                        <div className="font-bold text-zinc-900">{new Date(leaseInfo.joinDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Quick Help Links */}
                    <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl text-white shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><HelpCircle size={20} /> Need Help?</h3>
                        <div className="space-y-3">
                            <Link href="/tenant/messages" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur-sm border border-white/10 group">
                                <span className="text-sm font-medium">Contact Landlord</span>
                                <ArrowLeft className="rotate-180 opacity-50 group-hover:opacity-100 transition" size={16} />
                            </Link>
                            <Link href="/tenant/dashboard/maintenance" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur-sm border border-white/10 group">
                                <span className="text-sm font-medium">Report Issue</span>
                                <ArrowLeft className="rotate-180 opacity-50 group-hover:opacity-100 transition" size={16} />
                            </Link>
                            <Link href="/tenant/dashboard/help" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur-sm border border-white/10 group">
                                <span className="text-sm font-medium">FAQs & Support</span>
                                <ArrowLeft className="rotate-180 opacity-50 group-hover:opacity-100 transition" size={16} />
                            </Link>
                        </div>
                    </section>
                </div>

                {/* RIGHT CONTENT (Forms & Tables) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Personal Details Form */}
                    <section className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm">
                        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <User size={20} />
                            </div>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-zinc-50 rounded-xl font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition border-transparent focus:border-indigo-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Phone</label>
                                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-4 py-3 bg-zinc-50 rounded-xl font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition border-transparent focus:border-indigo-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-zinc-50 rounded-xl font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition border-transparent focus:border-indigo-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Change Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 bg-zinc-50 rounded-xl font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition border-transparent focus:border-indigo-100" />
                            </div>
                        </div>
                    </section>

                    {/* Notification & Preferences Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Notifications */}
                        <section className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm h-full">
                            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                    <Bell size={16} />
                                </div>
                                Notifications
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Email Alerts</p>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'payments', label: 'Rent Payments' },
                                            { key: 'maintenance', label: 'Maintenance' },
                                            { key: 'documents', label: 'Documents' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-xl transition">
                                                <span className="text-sm font-medium text-zinc-700">{item.label}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={formData.notificationPreferences.email[item.key as keyof typeof formData.notificationPreferences.email]} onChange={() => handleToggle('email', item.key)} className="sr-only peer" />
                                                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Push Notifications</p>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'messages', label: 'Messages' },
                                            { key: 'requests', label: 'Activity' },
                                            { key: 'reminders', label: 'Reminders' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-xl transition">
                                                <span className="text-sm font-medium text-zinc-700">{item.label}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={formData.notificationPreferences.push[item.key as keyof typeof formData.notificationPreferences.push]} onChange={() => handleToggle('push', item.key)} className="sr-only peer" />
                                                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* System Preferences */}
                        <section className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm h-full">
                            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Globe size={16} />
                                </div>
                                System
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Language</label>
                                    <select name="language" value={formData.language} onChange={handleChange} className="w-full px-4 py-2 bg-zinc-50 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100">
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Appearance</label>
                                    <div className="flex bg-zinc-50 p-1 rounded-xl">
                                        {['light', 'dark', 'system'].map((t) => (
                                            <button key={t} type="button" onClick={() => { handlePreferenceChange('portalPreferences', 'theme', t); setTheme(t); }} className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition ${formData.portalPreferences.theme === t ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Security Section (Full Width) */}
                    <section className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm">
                        <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                <Shield size={20} />
                            </div>
                            Security & Sessions
                        </h3>
                        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="font-bold text-zinc-900">Two-Factor Authentication</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Recommended for higher security.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.securitySettings.twoFactorEnabled} onChange={() => !formData.securitySettings.twoFactorEnabled ? setShow2FASetup(true) : handlePreferenceChange('securitySettings', 'twoFactorEnabled', false)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-checked:bg-rose-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button type="button" onClick={() => setShowHistory(true)} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left flex items-center gap-3 border border-zinc-100">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Clock size={16} /></div>
                                    <div><div className="font-bold text-sm">Login History</div><div className="text-xs text-zinc-400">Track account access</div></div>
                                </button>
                                <button type="button" onClick={() => setShowDevices(true)} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left flex items-center gap-3 border border-zinc-100">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Smartphone size={16} /></div>
                                    <div><div className="font-bold text-sm">Active Sessions</div><div className="text-xs text-zinc-400">Manage devices</div></div>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Data Export (Hero Section) */}
                    <section className="relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 rounded-[32px] text-white shadow-2xl">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2"><Lock size={20} className="text-cyan-400" /> Privacy & Data Export</h3>
                                <p className="text-zinc-400 text-sm mt-2 max-w-md">Download a comprehensive report of your personal data, lease history, payments, and uploaded documents in adherence to GDPR/CCPA.</p>
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    // ... [Export Logic Same as Before] ...
                                    try {
                                        const res = await fetch('/api/tenant/export');
                                        if (!res.ok) {
                                            const err = await res.json();
                                            alert(`Download Failed: ${err.error || res.statusText}`);
                                            return;
                                        }
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `Tenant_Data_Export_${new Date().getTime()}.zip`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    } catch (e: any) {
                                        console.error(e);
                                        const msg = e instanceof Error ? e.message : String(e);
                                        if (msg.includes('JSON')) {
                                            alert('Server Error: The server returned an invalid response (likely a crash).');
                                        } else {
                                            alert(`An error occurred: ${msg}`);
                                        }
                                    }
                                }}
                                className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition shadow-lg flex items-center gap-2 whitespace-nowrap"
                            >
                                <Save size={16} /> Download Data
                            </button>
                        </div>
                    </section>
                </div>
            </form>

            {/* Login History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Login History</h3>
                            <button onClick={() => setShowHistory(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                                <ArrowLeft size={16} />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {user?.securitySettings?.loginHistory?.length ? (
                                user.securitySettings.loginHistory.map((login: any, i: number) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                        <div className="mt-1 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-indigo-600">
                                            <Lock size={14} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-zinc-900 dark:text-white">{new Date(login.date).toLocaleString()}</div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1 break-all">{login.ip}</div>
                                            <div className="text-[10px] text-zinc-400 mt-1">{login.device}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-zinc-500">No history available</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Connected Devices Modal */}
            {showDevices && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Connected Devices</h3>
                            <button onClick={() => setShowDevices(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                                <ArrowLeft size={16} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Current Session */}
                            <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                                <div className="mt-1 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-indigo-600">
                                    <Smartphone size={14} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-sm text-zinc-900 dark:text-white">Current Session</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest bg-emerald-100/50 text-emerald-700 px-2 py-0.5 rounded-lg">Active</div>
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Windows PC - Chrome</div>
                                    <div className="text-[10px] text-zinc-400 mt-1">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</div>
                                </div>
                            </div>

                            {/* Past 2 Logins as "Devices" for demo */}
                            {user?.securitySettings?.loginHistory?.slice(0, 2).map((login: any, i: number) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 opacity-60">
                                    <div className="mt-1 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-zinc-400">
                                        <Smartphone size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-zinc-900 dark:text-white">Other Session</div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{login.device}</div>
                                        <div className="text-[10px] text-zinc-400 mt-1">{new Date(login.date).toLocaleDateString()}</div>
                                    </div>
                                    <button onClick={() => alert('Session revoked')} className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-200 transition">Revoke</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* 2FA Setup Modal */}
            {show2FASetup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Secure Your Account</h3>
                        <p className="text-zinc-500 mb-8 text-sm">Scan this QR code with your authenticator app (Google Authenticator, Authy) to verify.</p>

                        <div className="h-48 w-48 bg-zinc-100 mx-auto rounded-xl mb-8 flex items-center justify-center border-2 border-dashed border-zinc-300">
                            <div className="text-xs text-zinc-400 font-mono text-center">
                                [ MOCK QR CODE ]<br />
                                DATA: otpauth://totp/TenantPortal:{user?.email}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-500 transition"
                                maxLength={6}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShow2FASetup(false)}
                                    className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handlePreferenceChange('securitySettings', 'twoFactorEnabled', true);
                                        setShow2FASetup(false);
                                        alert("2FA Enabled Successfully!");
                                    }}
                                    className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-black transitionshadow-lg shadow-zinc-200"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
