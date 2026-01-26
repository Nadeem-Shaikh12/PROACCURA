'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { CreditCard, Landmark, Receipt, Save, Loader2, DollarSign } from 'lucide-react';

export default function FinancialSettingsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        currency: 'INR',
        taxRate: 0,
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            ifsc: ''
        }
    });

    useEffect(() => {
        if (user?.financialSettings) {
            setSettings({
                currency: user.financialSettings.currency || 'INR',
                taxRate: user.financialSettings.taxRate || 0,
                bankDetails: {
                    accountName: user.financialSettings.bankDetails?.accountName || '',
                    accountNumber: user.financialSettings.bankDetails?.accountNumber || '',
                    bankName: user.financialSettings.bankDetails?.bankName || '',
                    ifsc: user.financialSettings.bankDetails?.ifsc || ''
                }
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, [e.target.name]: e.target.value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ financialSettings: settings })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Financial settings saved!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save financial settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Financial & Payments</h1>
                <p className="text-zinc-500">Configure rent collection, currencies, and bank details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Currency & Tax */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <DollarSign size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">General</h3>
                            <p className="text-xs text-zinc-500">Currency and tax reporting defaults</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Preferred Currency</label>
                            <select
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Tax Rate (GST/VAT)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="taxRate"
                                    value={settings.taxRate}
                                    onChange={handleChange}
                                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute right-3 top-2.5 text-zinc-400 pointer-events-none">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manual Bank Transfer */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Landmark size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Bank Transfer Details</h3>
                            <p className="text-xs text-zinc-500">Displayed to tenants for manual rent payments</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Account Holder Name</label>
                            <input
                                name="accountName"
                                value={settings.bankDetails.accountName}
                                onChange={handleBankChange}
                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Accout Number / IBAN</label>
                            <input
                                name="accountNumber"
                                value={settings.bankDetails.accountNumber}
                                onChange={handleBankChange}
                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Bank Name</label>
                                <input
                                    name="bankName"
                                    value={settings.bankDetails.bankName}
                                    onChange={handleBankChange}
                                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">IFSC / SWIFT Code</label>
                                <input
                                    name="ifsc"
                                    value={settings.bankDetails.ifsc}
                                    onChange={handleBankChange}
                                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Gateways */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <CreditCard size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Payment Gateways</h3>
                            <p className="text-xs text-zinc-500">Accept online payments (Processing fees may apply)</p>
                        </div>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {['stripe', 'razorpay', 'paypal'].map((gateway) => (
                            <div key={gateway} className="flex items-center justify-between p-4 hover:bg-zinc-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-zinc-700 capitalize w-24">{gateway}</div>
                                    <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Coming Soon</span>
                                </div>
                                <button className="text-sm text-zinc-400 font-medium cursor-not-allowed">Connect</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
