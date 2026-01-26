'use client';

import { useEffect, useState } from 'react';
import {
    PieChart as PieIcon,
    TrendingUp,
    Users,
    AlertCircle,
    IndianRupee,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

export default function ReportsPage() {
    const { user, isLoading } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchAnalytics();
    }, [user, isLoading]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`/api/landlord/analytics?landlordId=${user?.id}`);
            const json = await res.json();
            setData(json);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Generating Reports...</p>
        </div>
    );

    if (!data || data.error) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <AlertCircle className="text-red-500" size={40} />
            <p className="text-zinc-900 font-bold">Failed to load reports</p>
            <p className="text-zinc-500 text-sm">Please try refreshing the page.</p>
        </div>
    );

    const { occupancy, revenueTrends, paymentStats } = data;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                        <PieIcon size={20} />
                    </div>
                    Analytics & Reports
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">Insights into your property performance.</p>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={14} /> +2.5%
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Occupancy Rate</h3>
                        <p className="text-3xl font-black text-zinc-900">{occupancy.rate}%</p>
                        <p className="text-xs text-zinc-400 font-medium">{occupancy.occupied} / {occupancy.total} Units Occupied</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total Revenue (Last 6m)</h3>
                        <p className="text-3xl font-black text-zinc-900">
                            ₹{revenueTrends.reduce((sum: number, item: any) => sum + item.revenue, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-400 font-medium">Collected via app</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl">
                            <AlertCircle size={24} />
                        </div>
                        {paymentStats.find((s: any) => s.name === 'Overdue')?.value > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                Action Needed
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Overdue Bills</h3>
                        <p className="text-3xl font-black text-zinc-900">
                            {paymentStats.find((s: any) => s.name === 'Overdue')?.value || 0}
                        </p>
                        <p className="text-xs text-zinc-400 font-medium">Tenants with late payments</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend Chart */}
                <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-zinc-900">Revenue Trends</h3>
                        <p className="text-sm text-zinc-500 font-medium">Collected vs Pending Income</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrends}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Collected"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pending"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPending)"
                                    name="Pending"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Status Pie Chart */}
                <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-zinc-900">Payment Health</h3>
                        <p className="text-sm text-zinc-500 font-medium">Status distribution of all bills</p>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-zinc-600 font-bold ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-black text-zinc-900">
                                {paymentStats.reduce((a: any, b: any) => a + b.value, 0)}
                            </span>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Bills</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
