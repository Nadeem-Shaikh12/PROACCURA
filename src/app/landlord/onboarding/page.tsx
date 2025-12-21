'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building, MapPin, ChevronRight, Loader2, Home } from 'lucide-react';

export default function LandlordOnboarding() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);
    const [form, setForm] = useState({
        name: '',
        address: '',
        type: 'Apartment',
        units: '1',
        monthlyRent: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/landlord/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    landlordId: user?.id,
                    ...form
                })
            });

            if (res.ok) {
                router.push('/landlord/dashboard');
            } else {
                alert('Failed to add property. Please try again.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden flex flex-col md:flex-row">

                {/* Visual Side */}
                <div className="bg-zinc-900 p-8 text-white w-full md:w-2/5 flex flex-col justify-between">
                    <div>
                        <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                            <Home className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight mb-2">Setup Portfolio</h1>
                        <p className="text-zinc-400 text-sm">Add your first property to start managing tenants.</p>
                    </div>
                    <div className="mt-8 text-xs text-zinc-500 font-medium">
                        PropAccura © 2024
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-8 w-full md:w-3/5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-lg font-bold text-zinc-900 mb-6">Property Details</h2>

                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Property Name</label>
                            <input
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Sunshine Apartments"
                                className="w-full p-3 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 text-zinc-400" size={16} />
                                <input
                                    required
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    placeholder="City, State"
                                    className="w-full pl-10 p-3 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full p-3 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                >
                                    <option>Apartment</option>
                                    <option>House</option>
                                    <option>Shop</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Units</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.units}
                                    onChange={e => setForm({ ...form, units: e.target.value })}
                                    className="w-full p-3 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Monthly Rent (₹)</label>
                            <input
                                required
                                type="number"
                                value={form.monthlyRent}
                                onChange={e => setForm({ ...form, monthlyRent: e.target.value })}
                                placeholder="e.g. 15000"
                                className="w-full p-3 bg-zinc-50 rounded-xl font-bold border-transparent focus:bg-white focus:border-indigo-500 transition outline-none"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Add Property & Continue'}
                            {!loading && <ChevronRight size={16} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
