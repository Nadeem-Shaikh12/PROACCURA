'use client';

import { useState } from 'react';
import { Search, Home, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TenantApplyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        propertyId: '',
        fullName: '',
        mobile: '',
        idProofType: 'Aadhaar',
        idProofNumber: '',
        city: ''
    });

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/tenant/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to submit request');

            router.push('/tenant/dashboard?joined=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-8 max-w-lg mx-auto mt-12">
            <header className="mb-8 text-center">
                <div className="h-16 w-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Home size={32} />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">Join a Property</h1>
                <p className="text-zinc-500 mt-2">Enter the Property ID provided by your landlord.</p>
            </header>

            <form onSubmit={handleJoin} className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 space-y-4">
                {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{error}</div>}

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-1">Property ID</label>
                    <div className="relative mt-2">
                        <Search className="absolute left-4 top-3.5 text-zinc-300" size={20} />
                        <input
                            name="propertyId"
                            type="text"
                            placeholder="e.g. PROP-123"
                            className="w-full pl-12 pr-4 py-3 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-zinc-900 transition font-bold"
                            value={formData.propertyId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-1">Full Name</label>
                    <input
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 mt-2 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-zinc-900 transition font-medium"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-1">Mobile Number</label>
                    <input
                        name="mobile"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 mt-2 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-zinc-900 transition font-medium"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-1">ID Type</label>
                        <select
                            name="idProofType"
                            className="w-full px-4 py-3 mt-2 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-zinc-900 transition font-medium"
                            value={formData.idProofType}
                            onChange={handleChange}
                        >
                            <option value="Aadhaar">Aadhaar</option>
                            <option value="Passport">Passport</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-1">ID Number</label>
                        <input
                            name="idProofNumber"
                            type="text"
                            placeholder="XXXX XXXX"
                            className="w-full px-4 py-3 mt-2 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-zinc-900 transition font-medium"
                            value={formData.idProofNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 pl-1">Current City</label>
                    <input
                        name="city"
                        type="text"
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 mt-2 bg-zinc-50 rounded-xl border-none focus:ring-2 focus:ring-zinc-900 transition font-medium"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-6 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Request to Join <ArrowRight size={18} /></>}
                </button>
            </form>
        </div>
    );
}
