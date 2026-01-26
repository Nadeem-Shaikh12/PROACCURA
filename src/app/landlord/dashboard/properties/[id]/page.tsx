'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Home,
    MapPin,
    Users,
    IndianRupee,
    Loader2,
    ChevronLeft,
    Edit3,
    Save,
    X,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    Layers,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Property {
    id: string;
    name: string;
    address: string;
    units: number;
    occupiedUnits: number;
    monthlyRent: number;
    type: string;
    createdAt: string;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Property>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchProperty();
        }
    }, [user, isLoading, id]);

    const fetchProperty = async () => {
        try {
            const res = await fetch(`/api/landlord/properties?id=${id}`);
            const data = await res.json();

            // In our current API, GET returns { properties: [] } or something similar for list
            // Let's assume the API needs a specific detail endpoint or handles id filtering correctly
            // Based on route.ts GET: it takes landlordId and returns list. 
            // We might need to filter manually or update the API.

            const allRes = await fetch(`/api/landlord/properties?landlordId=${user?.id}`);
            const allData = await allRes.json();
            const found = allData.properties?.find((p: any) => p.id === id);

            if (found) {
                setProperty(found);
                setEditData(found);
            }
        } catch (error) {
            console.error("Error fetching property:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/landlord/properties', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...editData })
            });

            if (res.ok) {
                setProperty({ ...property!, ...editData });
                setIsEditing(false);
                alert('Property updated successfully!');
            } else {
                alert('Failed to update property');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving property');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-400" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Asset Details...</p>
        </div>
    );

    if (!property) return (
        <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Property not found</h2>
            <Link href="/landlord/dashboard/properties" className="text-indigo-600 hover:underline mt-4 block">
                Back to Portfolio
            </Link>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/landlord/dashboard/properties"
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-xs uppercase tracking-widest transition"
                >
                    <ChevronLeft size={16} /> Back to Portfolio
                </Link>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold text-xs uppercase transition hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-black transition disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:border-zinc-900 transition"
                        >
                            <Edit3 size={14} /> Edit Asset
                        </button>
                    )}
                </div>
            </div>

            {/* Header / Info Section */}
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="h-24 w-24 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-xl shadow-indigo-100">
                        <Home size={40} />
                    </div>

                    <div className="flex-1 space-y-4">
                        {isEditing ? (
                            <div className="space-y-4">
                                <input
                                    className="text-4xl font-bold text-zinc-900 bg-zinc-50 border-none rounded-xl px-4 py-2 w-full outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                />
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <MapPin size={18} />
                                    <input
                                        className="text-lg bg-zinc-50 border-none rounded-lg px-3 py-1 w-full outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={editData.address}
                                        onChange={e => setEditData({ ...editData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-none">{property.name}</h1>
                                <div className="flex items-center gap-2 text-zinc-500 font-medium text-lg italic">
                                    <MapPin size={18} className="text-indigo-400" /> {property.address}
                                </div>
                            </>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4">
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-emerald-100">
                                <ShieldCheck size={14} /> Verified Asset
                            </span>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-indigo-100">
                                <Layers size={14} /> {property.type}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-900 rounded-[32px] p-8 text-white min-w-[200px] shadow-2xl shadow-zinc-200">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Base Monthly Rent</div>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">₹</span>
                                <input
                                    type="number"
                                    className="text-3xl font-bold bg-white/10 border-none rounded-lg px-3 py-1 w-full outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    value={editData.monthlyRent}
                                    onChange={e => setEditData({ ...editData, monthlyRent: Number(e.target.value) })}
                                />
                            </div>
                        ) : (
                            <div className="text-4xl font-bold tracking-tighter">₹{property.monthlyRent}</div>
                        )}
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                            <TrendingUp size={14} /> +4% From Last Year
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={<Users className="text-blue-500" />}
                    label="Occupancy Rate"
                    value={`${Math.round((property.occupiedUnits / property.units) * 100) || 0}%`}
                    desc={`${property.occupiedUnits} of ${property.units} Units Filied`}
                />
                <MetricCard
                    icon={<IndianRupee className="text-emerald-500" />}
                    label="Annual Yield"
                    value={`₹${property.monthlyRent * 12 * property.units / 100000}L`}
                    desc="Potential Revenue / Year"
                />
                <MetricCard
                    icon={<Activity className="text-amber-500" />}
                    label="Active Issues"
                    value="2"
                    desc="Pending Maintenance"
                    status="warning"
                />
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Information Table */}
                <div className="bg-white rounded-[32px] border border-zinc-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                        Technical Specifications
                    </h3>
                    <div className="space-y-4">
                        <SpecRow label="Property Type" value={property.type} />
                        <SpecRow label="Total Floor Area" value="1,240 sq.ft (Est.)" />
                        <SpecRow label="Power Supply" value="Phase 3 Continuous" />
                        <SpecRow label="Water Source" value="Municipal + Borewell" />
                        <SpecRow label="Building Age" value="5 Years" />
                    </div>
                </div>

                {/* Status Column */}
                <div className="bg-zinc-50 rounded-[32px] p-8 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm border border-zinc-100">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">Compliance & Legal</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">This property has all necessary municipal approvals and insurance coverage up to 2026.</p>
                    <button className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition">View Documents</button>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, desc, status = 'default' }: any) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm space-y-4 group hover:border-zinc-300 transition-all">
            <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-3xl font-black text-zinc-900 tracking-tight">{value}</h4>
                    {status === 'warning' && <AlertCircle size={16} className="text-amber-500" />}
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-1">{desc}</p>
            </div>
        </div>
    );
}

function SpecRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
            <span className="text-sm text-zinc-500 font-medium">{label}</span>
            <span className="text-sm text-zinc-900 font-bold">{value}</span>
        </div>
    );
}
