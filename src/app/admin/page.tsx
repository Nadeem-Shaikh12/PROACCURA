'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    MessageSquare,
    TrendingUp,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    CreditCard,
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface Stats {
    totalUsers: number;
    totalProperties: number;
    openTickets: number;
    pendingVerifications: number;
    totalRevenue: number;
}

const MOCK_CHART_DATA = [
    { name: 'Jan', revenue: 4000, users: 240 },
    { name: 'Feb', revenue: 3000, users: 198 },
    { name: 'Mar', revenue: 2000, users: 980 },
    { name: 'Apr', revenue: 2780, users: 390 },
    { name: 'May', revenue: 1890, users: 480 },
    { name: 'Jun', revenue: 2390, users: 380 },
    { name: 'Jul', revenue: 3490, users: 430 },
];

const StatCard = ({ title, value, icon: Icon, trend, color }: {
    title: string;
    value: number | undefined;
    icon: any;
    trend?: number;
    color: string;
}) => (
    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/10 transition-colors`} />
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-black ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'} bg-white px-2 py-1 rounded-lg border border-zinc-50 shadow-sm`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                {typeof value === 'number' && title.includes('Revenue') ? '₹' : ''}
                {value?.toLocaleString()}
            </h3>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading admin stats:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
            </div>
        );
    }


    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Live System</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Platform Hub</h1>
                    <p className="text-zinc-500 font-medium">Global overview of your rental platform performance.</p>
                </div>
                <div className="flex bg-white border border-zinc-200 p-1.5 rounded-2xl shadow-sm">
                    <button className="px-5 py-2 text-sm font-bold bg-zinc-900 text-white rounded-xl shadow-lg shadow-zinc-200 transition-transform active:scale-95">Download Reports</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Platform Revenue"
                    value={stats?.totalRevenue}
                    icon={CreditCard}
                    trend={12}
                    color="emerald"
                />
                <StatCard
                    title="Global User Base"
                    value={stats?.totalUsers}
                    icon={Users}
                    trend={8}
                    color="indigo"
                />
                <StatCard
                    title="Active Properties"
                    value={stats?.totalProperties}
                    icon={Building2}
                    trend={-2}
                    color="zinc"
                />
                <StatCard
                    title="Unresolved Tickets"
                    value={stats?.openTickets}
                    icon={MessageSquare}
                    color="rose"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Revenue Analytics</h3>
                            <p className="text-sm text-zinc-400 font-medium">Growth analysis over the last 6 months</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 bg-zinc-900 rounded-full" />
                            <span className="w-3 h-3 bg-zinc-200 rounded-full group-hover:bg-zinc-400 transition-colors" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_CHART_DATA}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/10 transition-colors" />

                    <div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <Activity className="text-white" size={28} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">System Status</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            All platform microservices are operating within nominal parameters. Average API latency: 45ms.
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {[
                            { label: 'Database Node', status: 'Healthy', val: 98 },
                            { label: 'File Storage', status: 'Healthy', val: 100 },
                            { label: 'Push Notifications', status: 'Delay (2s)', val: 45 },
                        ].map((node) => (
                            <div key={node.label}>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-zinc-400">{node.label}</span>
                                    <span className={node.val > 80 ? 'text-emerald-400' : 'text-amber-400'}>{node.status}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${node.val > 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                        style={{ width: `${node.val}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 w-full py-4 bg-white text-zinc-900 font-black rounded-2xl text-sm transition-transform active:scale-95 shadow-xl shadow-white/5 uppercase tracking-widest">
                        Advanced Logs
                    </button>
                </div>
            </div>

            {/* Verification Queue & Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden border-t-4 border-t-amber-400">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                            <ShieldCheck className="text-amber-500" size={22} />
                            Pending Trust Checks
                        </h3>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {stats?.pendingVerifications} Required
                        </span>
                    </div>
                    {stats?.pendingVerifications === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                                <CheckCircle2 className="text-zinc-200" size={32} />
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Queue Clear</p>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm font-medium">There are landlords and tenants waiting for identity verification. Addressing these promptly increases platform trust score.</p>
                    )}
                    <button className="mt-8 w-full py-3 border-2 border-zinc-900 text-zinc-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all duration-300">
                        Open Verification Hub
                    </button>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-6">Recent Platform Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 transition-colors group-hover:rotate-12 duration-500">
                                    <Activity className="text-zinc-400 group-hover:text-white transition-colors" size={18} />
                                </div>
                                <div className="flex-1 border-b border-zinc-50 pb-4 last:border-0 group-hover:translate-x-1 transition-transform">
                                    <p className="text-sm font-bold text-zinc-900">New premium landlord registered</p>
                                    <p className="text-xs text-zinc-400 font-medium tracking-tight">Mumbai South, India • 2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
