'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    BarChart3,
    Users,
    Home,
    AlertCircle,
    Loader2,
    ArrowRight,
    TrendingUp,
    DollarSign,
    Building2,
    Calendar,
    ChevronRight,
    Search,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Chatbot from '@/components/dashboard/Chatbot';
import { useAuth } from '@/context/AuthContext';

export default function LandlordDashboard() {
    const { user, isLoading } = useAuth();
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeTenants: 0,
        pendingRequests: 0,
        rentPending: 0,
        rentCollected: 0,
        occupancyRate: 0
    });
    const [requests, setRequests] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProperties = useMemo(() => {
        return properties.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [properties, searchQuery]);

    const filteredRequests = useMemo(() => {
        return requests.filter(r =>
            r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.propertyName && r.propertyName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [requests, searchQuery]);

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
        }
        if (user) fetchDashboardData();
    }, [user, isLoading]);

    const fetchDashboardData = async () => {
        try {
            const [propsRes, tenantsRes, requestsRes, analyticsRes] = await Promise.all([
                fetch(`/api/landlord/properties?landlordId=${user?.id}`),
                fetch('/api/landlord/tenants'),
                fetch('/api/landlord/requests'),
                fetch(`/api/landlord/analytics?landlordId=${user?.id}`)
            ]);

            const propsData = await propsRes.json();
            const tenantsData = await tenantsRes.json();
            const requestsData = await requestsRes.json();
            const analyticsData = await analyticsRes.json();

            const fetchedProperties = propsData.properties || [];
            if (fetchedProperties.length === 0) {
                window.location.href = '/landlord/onboarding';
                return;
            }

            const tenants = tenantsData.tenants || [];
            const allRequests = requestsData.requests || [];
            const pendingReqs = allRequests.filter((r: any) => r.status === 'pending');

            // Analytics Data Handling
            const { occupancy, revenueTrends } = analyticsData || {};
            const currentMonthIndex = new Date().getMonth();

            // Get current month's revenue stats from specific month logic or default to last entry
            // The API returns last 6 months, last index is current month usually.
            const currentMonthStats = revenueTrends ? revenueTrends[revenueTrends.length - 1] : { revenue: 0, pending: 0 };

            // Calculate Portfolio Value (using sum of property rents or similar heuristic)
            // Just sum of potential rent (monthlyRent * units)
            const portfolioValue = fetchedProperties.reduce((sum: number, p: any) => sum + (p.monthlyRent * p.units), 0);

            setStats({
                totalProperties: fetchedProperties.length,
                activeTenants: tenants.length,
                pendingRequests: pendingReqs.length,
                rentPending: currentMonthStats?.pending || 0,
                rentCollected: currentMonthStats?.revenue || 0,
                occupancyRate: occupancy?.rate || 0
            });

            setProperties(fetchedProperties.slice(0, 3));
            setRequests(pendingReqs.slice(0, 4));
        } catch (e) {
            console.error('Failed to fetch dashboard data', e);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || (loading && !stats.totalProperties)) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Synchronizing Portfolio...</p>
        </div>
    );

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto">
            {/* Top Bar / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                        {greeting()}, {user?.name.split(' ')[0]} <span className="animate-bounce">👋</span>
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium italic">Everything looks great today. You have {stats.pendingRequests} actions pending.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={18} />
                    <input
                        type="text"
                        placeholder="Search tenants, properties..."
                        className="bg-white border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 border p-3 pl-12 rounded-2xl w-full md:w-80 outline-none transition-all font-bold text-sm text-slate-900 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Portfolio Value"
                    value={`₹${(stats.rentCollected + stats.rentPending).toLocaleString()}`}
                    subValue={`${stats.occupancyRate}% Unit Occupancy`}
                    icon={<DollarSign className="text-emerald-600" />}
                    color="emerald"
                />
                <StatCard
                    label="Active Stays"
                    value={stats.activeTenants}
                    subValue={`Across ${stats.totalProperties} Assets`}
                    icon={<Users className="text-blue-600" />}
                    color="blue"
                />
                <StatCard
                    label="Pending Actions"
                    value={stats.pendingRequests}
                    subValue="Requires review"
                    icon={<AlertCircle className="text-rose-600" />}
                    color="rose"
                    trend="+2 today"
                    isAlert={stats.pendingRequests > 0}
                />
                <StatCard
                    label="Rent Collected"
                    value={`₹${stats.rentCollected.toLocaleString()}`}
                    subValue={`${Math.round((stats.rentCollected / (stats.rentCollected + stats.rentPending || 1)) * 100)}% Monthly Progress`}
                    icon={<TrendingUp className="text-blue-600" />}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-10">
                    {/* Portfolio Preview */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Portfolio</h2>
                            <Link href="/landlord/dashboard/properties" className="text-sm font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all hover:gap-2">
                                Market Insights <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredProperties.length === 0 ? (
                                <div className="col-span-full py-12 text-center bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[32px]">
                                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No matching assets</p>
                                </div>
                            ) : (
                                <>
                                    {filteredProperties.slice(0, 4).map(prop => (
                                        <Link key={prop.id} href={`/landlord/dashboard/properties?id=${prop.id}`}>
                                            <div className="group bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-all duration-500">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em]">
                                                        {prop.type}
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-base text-zinc-900 group-hover:text-blue-600 transition">{prop.name}</h3>
                                                <p className="text-zinc-500 text-sm mb-4 line-clamp-1">{prop.address}</p>

                                                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(prop.occupiedUnits / prop.units) * 100}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                            {prop.occupiedUnits}/{prop.units} Units
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rent</div>
                                                        <div className="font-black text-zinc-900 tracking-tight">₹{prop.monthlyRent}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {filteredProperties.length > 4 && (
                                        <Link href="/landlord/dashboard/properties" className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dotted border-blue-200 bg-blue-50/10 hover:bg-blue-50/30 transition-all group">
                                            <span className="font-bold text-blue-600">View {filteredProperties.length - 4} more</span>
                                        </Link>
                                    )}
                                    <Link href="/landlord/dashboard/properties?new=true" className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                                        <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                                            <Home size={20} />
                                        </div>
                                        <span className="font-bold text-zinc-600 group-hover:text-blue-600">Add New Property</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Pending Actions */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Action Required</h2>
                            {stats.pendingRequests > 4 && (
                                <Link href="/landlord/dashboard/requests" className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-all hover:gap-2">
                                    View {stats.pendingRequests} more <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-300/20 overflow-hidden">
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="h-16 w-16 bg-zinc-50 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search size={32} />
                                    </div>
                                    <h3 className="font-black text-zinc-900 uppercase tracking-widest text-[10px]">No pending matches</h3>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-50">
                                    {filteredRequests.map(req => (
                                        <div key={req.id} className="p-6 hover:bg-zinc-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gradient-to-tr from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                                    {req.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-zinc-900">{req.fullName}</div>
                                                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                        <span className="font-medium text-blue-600">{req.propertyName}</span>
                                                        <span className="h-1 w-1 bg-zinc-300 rounded-full"></span>
                                                        <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href="/landlord/dashboard/requests" className="px-4 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-blue-600 transition-all shadow-md shadow-zinc-200 group-hover:shadow-blue-100">
                                                Review
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-10">
                    {/* Growth Card */}
                    <div className="bg-zinc-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative">
                            <h3 className="text-zinc-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Revenue Growth</h3>
                            <div className="text-3xl font-bold text-white tracking-tighter mb-4">₹{(stats.rentCollected).toLocaleString()}</div>
                            <div className="flex items-center gap-2 text-emerald-400 bg-white/5 w-fit px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/5">
                                <TrendingUp size={12} /> +12.4% This Year
                            </div>

                            <Link href="/landlord/dashboard/bills" className="mt-8 w-full bg-white text-zinc-900 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                                <DollarSign size={18} /> Manage Finances
                            </Link>
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-300/20 relative overflow-hidden">
                        <h3 className="text-base font-bold text-zinc-900 mb-6 tracking-tight">Quick Navigation</h3>
                        <div className="space-y-2">
                            <QuickLink href="/landlord/dashboard/tenants" label="Manage Tenants" desc="View all active stays" icon={<Users size={18} />} />
                            <QuickLink href="/landlord/messages" label="Message Center" desc="Chat with residents" icon={<MessageSquare size={18} />} />
                            <QuickLink href="/landlord/dashboard/bills" label="Billing System" desc="Send invoices & track" icon={<BarChart3 size={18} />} />
                            <QuickLink href="/landlord/dashboard/settings" label="Profile Settings" desc="Notification preferences" icon={<Calendar size={18} />} />
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 border-dashed text-center">
                        <h4 className="font-black text-blue-900 text-lg mb-2">Need Assistance?</h4>
                        <p className="text-blue-600/70 text-xs font-medium mb-6">Our dedicated support team is here to help you manage your empire.</p>
                        <button className="text-sm font-black text-blue-700 hover:underline">Chat with Guru</button>
                    </div>
                </div>
            </div>
            <Chatbot />
        </div>
    );
}

function StatCard({ label, value, subValue, icon, color, trend, isAlert }: any) {
    const colorClasses: any = {
        blue: "bg-blue-50 border-blue-100 text-blue-600",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
        rose: "bg-rose-50 border-rose-100 text-rose-600",
        amber: "bg-amber-50 border-amber-100 text-amber-600"
    };

    return (
        <div className={`p-6 rounded-[32px] border ${isAlert ? colorClasses.rose : 'bg-white border-slate-100'} shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-2xl ${colorClasses[color]} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full uppercase tracking-widest animate-pulse">
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tighter mb-1">{value}</div>
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xs font-medium text-zinc-500 line-clamp-1">{subValue}</div>
        </div>
    );
}

function QuickLink({ href, label, desc, icon }: any) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 hover:bg-zinc-50 rounded-2xl transition group border border-transparent hover:border-zinc-100">
            <div className="h-10 w-10 bg-zinc-50 text-zinc-500 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition">
                {icon}
            </div>
            <div>
                <div className="text-sm font-black text-zinc-900 leading-tight">{label}</div>
                <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{desc}</div>
            </div>
            <ChevronRight className="ml-auto text-zinc-300 group-hover:text-zinc-900 transition" size={16} />
        </Link>
    );
}

function BadgeCheck({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
    );
}
