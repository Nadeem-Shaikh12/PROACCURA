'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {
    Key,
    Link as LinkIcon,
    Activity,
    MessageSquare,
    Plus,
    Trash2,
    Shield,
    Globe,
    ExternalLink,
    CheckCircle2,
    Clock,
    Loader2,
    Save,
    Copy,
    Wrench
} from 'lucide-react';

export default function IntegrationsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);

    // Initial state matching our schema
    const [settings, setSettings] = useState({
        accounting: {
            provider: user?.integrationSettings?.accounting?.provider || 'quickbooks',
            connected: user?.integrationSettings?.accounting?.connected || false,
            lastSync: user?.integrationSettings?.accounting?.lastSync || null
        },
        communication: {
            twilio: {
                sid: user?.integrationSettings?.communication?.twilio?.sid || '',
                token: user?.integrationSettings?.communication?.twilio?.token || '',
                fromNumber: user?.integrationSettings?.communication?.twilio?.fromNumber || '',
                enabled: user?.integrationSettings?.communication?.twilio?.enabled || false
            },
            sendgrid: {
                apiKey: user?.integrationSettings?.communication?.sendgrid?.apiKey || '',
                fromEmail: user?.integrationSettings?.communication?.sendgrid?.fromEmail || '',
                enabled: user?.integrationSettings?.communication?.sendgrid?.enabled || false
            }
        },
        crm: {
            provider: user?.integrationSettings?.crm?.provider || 'salesforce',
            connected: user?.integrationSettings?.crm?.connected || false
        },
        developerApi: {
            keys: user?.integrationSettings?.developerApi?.keys || [],
            webhooks: user?.integrationSettings?.developerApi?.webhooks || []
        }
    });

    useEffect(() => {
        if (user?.integrationSettings) {
            setSettings({
                accounting: {
                    provider: user.integrationSettings.accounting?.provider || 'quickbooks',
                    connected: user.integrationSettings.accounting?.connected || false,
                    lastSync: user.integrationSettings.accounting?.lastSync || null
                },
                communication: {
                    twilio: user.integrationSettings.communication?.twilio || { sid: '', token: '', fromNumber: '', enabled: false },
                    sendgrid: user.integrationSettings.communication?.sendgrid || { apiKey: '', fromEmail: '', enabled: false }
                },
                crm: user.integrationSettings.crm || { provider: 'salesforce', connected: false },
                developerApi: user.integrationSettings.developerApi || { keys: [], webhooks: [] }
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ integrationSettings: settings })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Integrations updated successfully!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const generateApiKey = () => {
        setIsGeneratingKey(true);
        setTimeout(() => {
            const newKey = {
                name: 'Production Key ' + (settings.developerApi.keys.length + 1),
                key: 'pk_live_' + Math.random().toString(36).substring(7),
                role: 'admin' as const,
                createdAt: new Date().toISOString()
            };
            setSettings(prev => ({
                ...prev,
                developerApi: {
                    ...prev.developerApi,
                    keys: [...prev.developerApi.keys, newKey]
                }
            }));
            setIsGeneratingKey(false);
        }, 1000);
    };

    const revokeKey = (keyString: string) => {
        setSettings(prev => ({
            ...prev,
            developerApi: {
                ...prev.developerApi,
                keys: prev.developerApi.keys.filter(k => k.key !== keyString)
            }
        }));
    };

    const addWebhook = () => {
        const url = prompt('Enter Webhook URL (HTTPS required):');
        if (url && url.startsWith('https://')) {
            const newWebhook = {
                id: Math.random().toString(36).substring(7),
                url,
                events: ['payment.received', 'maintenance.created'],
                enabled: true
            };
            setSettings(prev => ({
                ...prev,
                developerApi: {
                    ...prev.developerApi,
                    webhooks: [...prev.developerApi.webhooks, newWebhook]
                }
            }));
        } else {
            alert('Please enter a valid HTTPS URL');
        }
    };

    return (
        <div className="max-w-4xl space-y-10 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Integrations & API</h1>
                <p className="text-zinc-500 text-sm mt-1 font-medium">Connect external services and manage platform access.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">

                {/* 1. API Keys Row */}
                <section className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl border border-zinc-200 shadow-sm text-zinc-900">
                                <Key size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Developer API Keys</h3>
                                <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase mt-0.5 opacity-70">Internal & External Tokens</p>
                            </div>
                        </div>
                        <button
                            disabled={isGeneratingKey}
                            onClick={generateApiKey}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition disabled:opacity-50"
                        >
                            {isGeneratingKey ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            Create New Key
                        </button>
                    </div>

                    <div className="p-6">
                        {settings.developerApi.keys.length > 0 ? (
                            <div className="space-y-4">
                                {settings.developerApi.keys.map((k, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-zinc-900 text-sm">{k.name}</span>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${k.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {k.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                                                <span className="bg-zinc-200 px-2 py-0.5 rounded text-zinc-600">{k.key}</span>
                                                <button className="hover:text-zinc-900" onClick={() => { navigator.clipboard.writeText(k.key); alert('Copied!'); }}><Copy size={12} /></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-right">
                                            <div className="text-[10px] text-zinc-400">Created: {new Date(k.createdAt).toLocaleDateString()}</div>
                                            <button
                                                onClick={() => revokeKey(k.key)}
                                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-400 text-sm italic">
                                No active API keys. Generate one to start Integrating.
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Connected Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Accounting Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                            <Activity size={14} className="text-indigo-500" /> Accounting
                        </h4>
                        <div className={`group relative bg-white p-6 rounded-[32px] border ${settings.accounting.connected ? 'border-emerald-200 bg-emerald-50/20' : 'border-zinc-200'} transition shadow-sm`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-100">Q</div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">QuickBooks</h3>
                                        <p className="text-[11px] text-zinc-500 font-medium">Sync rentals with bookkeeping.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, accounting: { ...prev.accounting, connected: !prev.accounting.connected, provider: 'quickbooks' } }))}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${settings.accounting.connected && settings.accounting.provider === 'quickbooks' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                                >
                                    {settings.accounting.connected && settings.accounting.provider === 'quickbooks' ? 'Connected' : 'Connect'}
                                </button>
                            </div>
                            {settings.accounting.connected && settings.accounting.provider === 'quickbooks' && (
                                <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><Clock size={12} /> Auto-Sync: Enabled</span>
                                    <button className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase">Settings</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Communication Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                            <MessageSquare size={14} className="text-pink-500" /> Communication
                        </h4>
                        <div className={`p-6 bg-white rounded-[32px] border ${settings.communication.twilio.enabled ? 'border-zinc-900' : 'border-zinc-100'} transition-all shadow-sm`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-rose-100 uppercase tracking-tighter">Twilio</div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">Twilio SMS</h3>
                                        <p className="text-[11px] text-zinc-500 font-medium">Send SMS Notifications.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.communication.twilio.enabled}
                                        onChange={() => setSettings(prev => ({ ...prev, communication: { ...prev.communication, twilio: { ...prev.communication.twilio, enabled: !prev.communication.twilio.enabled } } }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                                </label>
                            </div>
                            {settings.communication.twilio.enabled && (
                                <div className="space-y-3 pt-4 border-t border-zinc-50">
                                    <input
                                        type="text"
                                        placeholder="Account SID"
                                        value={settings.communication.twilio.sid}
                                        onChange={(e) => setSettings(prev => ({ ...prev, communication: { ...prev.communication, twilio: { ...prev.communication.twilio, sid: e.target.value } } }))}
                                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-mono"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Auth Token"
                                        value={settings.communication.twilio.token}
                                        onChange={(e) => setSettings(prev => ({ ...prev, communication: { ...prev.communication, twilio: { ...prev.communication.twilio, token: e.target.value } } }))}
                                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-mono"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CRM Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                            <Shield size={14} className="text-blue-500" /> CRM & Sales
                        </h4>
                        <div className={`p-6 bg-white rounded-[32px] border ${settings.crm.connected ? 'border-blue-200 bg-blue-50/30' : 'border-zinc-100'} transition-all shadow-sm`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-sky-100 uppercase tracking-tighter">SF</div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">Salesforce</h3>
                                        <p className="text-[11px] text-zinc-500 font-medium">Sync tenant history.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, crm: { ...prev.crm, connected: !prev.crm.connected } }))}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${settings.crm.connected ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}
                                >
                                    {settings.crm.connected ? 'Enabled' : 'Connect'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Systems */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                            <Wrench size={14} className="text-amber-500" /> Maintenance Systems
                        </h4>
                        <div className="p-6 bg-white rounded-[32px] border border-zinc-100 group shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                                        <ExternalLink size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">External Work Orders</h3>
                                        <p className="text-[11px] text-zinc-500 font-medium">Link with Specialized Tools.</p>
                                    </div>
                                </div>
                                <button className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-400 cursor-not-allowed">Coming Soon</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Webhook Section */}
                <section className="bg-zinc-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 text-cyan-400">
                                        <Globe size={20} />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight underline decoration-cyan-400/30 decoration-4 underline-offset-4">Webhook Endpoints</h3>
                                </div>
                                <p className="text-zinc-400 text-sm max-w-md font-medium">Receive real-time notifications on your server when app events occur.</p>
                            </div>
                            <button
                                onClick={addWebhook}
                                className="bg-cyan-500 text-zinc-900 px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-cyan-400 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-cyan-500/20"
                            >
                                <Plus size={18} />
                                Add Webhook URL
                            </button>
                        </div>

                        {settings.developerApi.webhooks.length > 0 ? (
                            <div className="space-y-4">
                                {settings.developerApi.webhooks.map((w) => (
                                    <div key={w.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm text-zinc-100">{w.url}</span>
                                                <span className={`h-2 w-2 rounded-full ${w.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                                            </div>
                                            <div className="flex gap-2">
                                                {w.events.map(ev => (
                                                    <span key={ev} className="text-[9px] font-black uppercase tracking-wider bg-white/10 text-zinc-400 px-2 py-0.5 rounded">{ev}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSettings(prev => ({ ...prev, developerApi: { ...prev.developerApi, webhooks: prev.developerApi.webhooks.filter(item => item.id !== w.id) } }))}
                                            className="text-white/30 hover:text-white transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-zinc-500 text-sm font-mono italic bg-white/5 rounded-3xl border border-dashed border-white/10">
                                No webhooks configured.
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex justify-end pr-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-10 py-4 bg-zinc-900 text-white font-black rounded-[20px] hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-zinc-200/50 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Integration Config
                    </button>
                </div>
            </div>
        </div>
    );
}
