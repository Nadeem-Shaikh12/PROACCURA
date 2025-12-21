'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Home,
    Plus,
    MapPin,
    DollarSign,
    Loader2,
    Building2,
    ChevronRight,
    Layers,
    TrendingUp,
    LayoutGrid,
    Search,
    X,
    BadgeCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Property {
    id: string;
    name: string;
    address: string;
    units: number;
    monthlyRent: number;
    type: string;
}

function PropertiesContent() {
    const { user, isLoading } = useAuth();
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newProp, setNewProp] = useState({ name: '', address: '', units: '', monthlyRent: '', type: 'Apartment' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchProperties();
    }, [user, isLoading]);

    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setIsAdding(true);
        }
    }, [searchParams]);

    const fetchProperties = async () => {
        try {
            const res = await fetch(`/api/landlord/properties?landlordId=${user?.id}`);
            const data = await res.json();
            if (data.properties) setProperties(data.properties);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = useMemo(() => {
        return properties.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [properties, searchQuery]);

    const handleDeleteProperty = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property? This will remove all associated data.')) return;

        try {
            const res = await fetch(`/api/landlord/properties?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProperties();
            } else {
                alert('Failed to delete property');
            }
        } catch (e) {
            alert('An error occurred');
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/landlord/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newProp, landlordId: user?.id })
            });
            if (res.ok) {
                setIsAdding(false);
                fetchProperties();
                setNewProp({ name: '', address: '', units: '', monthlyRent: '', type: 'Apartment' });
            }
        } catch (e) {
            alert('Failed to add property');
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-400" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Properties...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                            <Building2 size={20} />
                        </div>
                        Property Portfolio
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Add and manage your retail, residential or commercial spaces.</p>
                </div>

                <div className="flex flex-1 max-w-md bg-white border border-zinc-100 rounded-2xl px-5 py-3 shadow-sm focus-within:ring-2 ring-indigo-500/10 transition-all">
                    <Search className="text-zinc-400 mr-3" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets by name or city..."
                        className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:text-zinc-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Asset
                </button>
            </header>

            {/* Form Overlay/Modal Simulation */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Register New Asset</h3>
                                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Property details</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Property Name</label>
                                    <input
                                        placeholder="e.g. Skyline Residency"
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        value={newProp.name}
                                        onChange={e => setNewProp({ ...newProp, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Address / Location</label>
                                    <input
                                        placeholder="Complete address or Area"
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        value={newProp.address}
                                        onChange={e => setNewProp({ ...newProp, address: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Total Units</label>
                                        <input
                                            type="number"
                                            placeholder="Total units/rooms"
                                            className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                            value={newProp.units}
                                            onChange={e => setNewProp({ ...newProp, units: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Base Rent (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Monthly rent amount"
                                            className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                            value={newProp.monthlyRent}
                                            onChange={e => setNewProp({ ...newProp, monthlyRent: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-zinc-900 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                Add to Portfolio
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map(prop => (
                    <div key={prop.id} className="bg-white p-2 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-16 w-16 bg-gradient-to-tr from-zinc-50 to-white text-zinc-900 rounded-[20px] shadow-inner flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <Home size={28} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(prop.id); }}
                                        className="p-2 bg-rose-50 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                                        title="Delete Asset"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="bg-zinc-100 text-zinc-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                        ID: {prop.id.slice(-6)}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-zinc-900 leading-tight mb-1 group-hover:text-indigo-600 transition">{prop.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-zinc-400 font-medium mb-6">
                                <MapPin size={14} className="text-indigo-400" /> {prop.address}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100/50">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <Layers size={10} /> Capacity
                                    </div>
                                    <div className="text-base font-bold text-zinc-900 tracking-tight">{prop.units} Units</div>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
                                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <DollarSign size={10} /> Monthly
                                    </div>
                                    <div className="text-base font-bold text-emerald-700 tracking-tight">₹{prop.monthlyRent}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-2">
                            <Link
                                href={`/landlord/dashboard/properties/${prop.id}`}
                                className="w-full bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white p-3 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-wider transition-all"
                            >
                                <LayoutGrid size={14} /> Asset Details <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-zinc-400" size={40} />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Properties...</p>
            </div>
        }>
            <PropertiesContent />
        </Suspense>
    );
}
