'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Users, FileText, Wrench, Shield, Save, Loader2, Check } from 'lucide-react';

export default function PortalSettingsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        allowDocumentUploads: true,
        showPaymentHistory: true,
        showMaintenanceRequests: true,
        requireRentersInsurance: false,
        autoInvite: false
    });

    useEffect(() => {
        if (user?.tenantPortalSettings) {
            setSettings({
                allowDocumentUploads: user.tenantPortalSettings.allowDocumentUploads ?? true,
                showPaymentHistory: user.tenantPortalSettings.showPaymentHistory ?? true,
                showMaintenanceRequests: user.tenantPortalSettings.showMaintenanceRequests ?? true,
                requireRentersInsurance: user.tenantPortalSettings.requireRentersInsurance ?? false,
                autoInvite: user.tenantPortalSettings.autoInvite ?? false
            });
        }
    }, [user]);

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantPortalSettings: settings })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Portal settings updated!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update portal settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Tenant Portal Controls</h1>
                <p className="text-zinc-500">Customize what tenants can see and do in their app.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Feature Visibility */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Users size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Portal Features</h3>
                            <p className="text-xs text-zinc-500">Enable or disable specific sections</p>
                        </div>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        <ToggleRow
                            title="Maintenance Requests"
                            desc="Allow tenants to submit issues directly via app."
                            checked={settings.showMaintenanceRequests}
                            onChange={() => toggle('showMaintenanceRequests')}
                            icon={<Wrench size={16} />}
                        />
                        <ToggleRow
                            title="Payment History"
                            desc="Tenants can view past rent payments and receipts."
                            checked={settings.showPaymentHistory}
                            onChange={() => toggle('showPaymentHistory')}
                            icon={<FileText size={16} />}
                        />
                        <ToggleRow
                            title="Document Uploads"
                            desc="Allow tenants to upload ID proofs and agreements."
                            checked={settings.allowDocumentUploads}
                            onChange={() => toggle('allowDocumentUploads')}
                            icon={<FileText size={16} />}
                        />
                    </div>
                </div>

                {/* Requirements & Automation */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Requirements & Automation</h3>
                            <p className="text-xs text-zinc-500">Compliance and onboarding rules</p>
                        </div>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        <ToggleRow
                            title="Require Renters Insurance"
                            desc="Mandatory upload of insurance policy before move-in."
                            checked={settings.requireRentersInsurance}
                            onChange={() => toggle('requireRentersInsurance')}
                        />
                        <ToggleRow
                            title="Auto-Invite New Tenants"
                            desc="Automatically email portal access when a tenant added."
                            checked={settings.autoInvite}
                            onChange={() => toggle('autoInvite')}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Update Controls
                    </button>
                </div>
            </form>
        </div>
    );
}

function ToggleRow({ title, desc, checked, onChange, icon }: any) {
    return (
        <div className="flex items-center justify-between p-5 hover:bg-zinc-50/50 transition">
            <div className="flex items-start gap-4">
                {icon && <div className="mt-1 text-zinc-400">{icon}</div>}
                <div>
                    <p className="font-medium text-zinc-900">{title}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">{desc}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 shrink-0 ${checked ? 'bg-zinc-900' : 'bg-zinc-200'}`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ease-in-out mt-1 ml-1 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        </div>
    )
}
