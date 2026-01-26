'use client';

import { useState } from 'react';
import { Shield, Key, Smartphone, AlertTriangle, Loader2 } from 'lucide-react';

export default function SecuritySettingsPage() {
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords don't match!");
            return;
        }
        setLoading(true);
        try {
            // Mock API
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Password updated successfully!');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Security & Access</h1>
                <p className="text-zinc-500">Manage your password and security settings.</p>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                        <Key size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900">Change Password</h3>
                        <p className="text-xs text-zinc-500">Update your account password</p>
                    </div>
                </div>
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-zinc-700 block mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading || !passwordData.current}
                            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-black transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Two-Factor Authentication (2FA)</h3>
                            <p className="text-xs text-zinc-500">Add an extra layer of security</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs font-semibold rounded-md">Disabled</span>
                </div>
                <div className="p-6">
                    <p className="text-sm text-zinc-600 mb-4">
                        Protect your account by requiring an additional code when logging in from a new device.
                    </p>
                    <button className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-sm font-medium transition">
                        Setup 2FA
                    </button>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                        <Smartphone size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900">Active Sessions</h3>
                        <p className="text-xs text-zinc-500">Manage devices logged into your account</p>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    {/* Current Session */}
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div>
                                <p className="text-sm font-medium text-emerald-900">Windows PC - Chrome</p>
                                <p className="text-xs text-emerald-600">Mumbai, India • Active Now</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Current</span>
                    </div>

                    {/* Other Session */}
                    <div className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50 transition">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900">iPhone 14 Pro - Safari</p>
                                <p className="text-xs text-zinc-500">Pune, India • 2 hours ago</p>
                            </div>
                        </div>
                        <button className="text-xs text-rose-600 font-medium hover:underline">Revoke</button>
                    </div>
                </div>
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-right">
                    <button className="text-xs text-rose-600 font-bold hover:underline">Log Out All Other Devices</button>
                </div>
            </div>

        </div>
    );
}
