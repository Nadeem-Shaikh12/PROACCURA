'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Building, Calendar, DollarSign, Clock, Save, Loader2 } from 'lucide-react';

export default function PropertyDefaultsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [defaults, setDefaults] = useState({
        rentDueDay: 1,
        gracePeriodDays: 5,
        lateFeePercentage: 5,
        defaultLeaseMonths: 12,
        requireSecurityDeposit: true,
        securityDepositMonths: 1
    });

    useEffect(() => {
        if (user?.propertyDefaults) {
            setDefaults({
                ...defaults,
                ...user.propertyDefaults,
                // Handle field name mismatch if any
                securityDepositMonths: (user.propertyDefaults as any).securityDepositMonths || 1
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(e.target.value);
        setDefaults({ ...defaults, [e.target.name]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyDefaults: defaults })
            });

            if (!res.ok) throw new Error('Failed to update defaults');

            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            }
            alert('Property defaults saved!');
        } catch (error) {
            console.error('Failed to update defaults', error);
            alert('Error updating defaults: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Property Defaults</h1>
                <p className="text-zinc-500">Set baseline rules for new properties to save time.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Rent & Lease Terms */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Rent & Lease Terms</h3>
                            <p className="text-xs text-zinc-500">Default schedule for new leases</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Default Rent Due Day</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="rentDueDay"
                                    min="1" max="28"
                                    value={defaults.rentDueDay}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-10 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute left-3 top-2.5 text-zinc-400 font-medium">Day</span>
                            </div>
                            <p className="text-xs text-zinc-400">Usually the 1st of the month</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Default Lease Duration</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="defaultLeaseMonths"
                                    value={defaults.defaultLeaseMonths}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-3 pr-16 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute right-3 top-2.5 text-zinc-400 pointer-events-none">Months</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fees & Deposits */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <DollarSign size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Fees & Deposits</h3>
                            <p className="text-xs text-zinc-500">Financial rules for violations and entry</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Grace Period</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="gracePeriodDays"
                                    value={defaults.gracePeriodDays}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-3 pr-12 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute right-3 top-2.5 text-zinc-400 pointer-events-none">Days</span>
                            </div>
                            <p className="text-xs text-zinc-400">Days before late fee applies</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Late Fee Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="lateFeePercentage"
                                    value={defaults.lateFeePercentage}
                                    onChange={handleChange}
                                    className="w-full p-2.5 pl-3 pr-8 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <span className="absolute right-3 top-2.5 text-zinc-400 pointer-events-none">%</span>
                            </div>
                            <p className="text-xs text-zinc-400">Percentage of monthly rent</p>
                        </div>

                        <div className="col-span-1 md:col-span-2 pt-2 border-t border-zinc-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium text-zinc-900">Require Security Deposit</label>
                                    <p className="text-xs text-zinc-500">Collect deposit before move-in</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="requireSecurityDeposit"
                                    checked={defaults.requireSecurityDeposit}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded text-zinc-900 focus:ring-zinc-900"
                                />
                            </div>
                            {defaults.requireSecurityDeposit && (
                                <div className="mt-4 flex items-center gap-4">
                                    <span className="text-sm text-zinc-600">Deposit Amount:</span>
                                    <div className="relative w-32">
                                        <input
                                            type="number"
                                            name="securityDepositMonths"
                                            value={defaults.securityDepositMonths}
                                            onChange={handleChange}
                                            className="w-full p-2 pl-3 pr-16 bg-white border border-zinc-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-2 text-zinc-400 text-xs pointer-events-none">Months Rent</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Defaults
                    </button>
                </div>
            </form>
        </div>
    );
}
