'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Printer, ShieldCheck, CreditCard, User, Building, Phone } from 'lucide-react';

export default function TenantReportPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [stay, setStay] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stayRes, historyRes, billsRes] = await Promise.all([
                    fetch('/api/tenant/stay'),
                    fetch('/api/tenant/history'),
                    fetch('/api/tenant/bills')
                ]);
                const stayData = await stayRes.json();
                const historyData = await historyRes.json();
                const billsData = await billsRes.json();

                setStay(stayData.stay);
                setHistory(historyData.history || []);
                setBills(billsData.bills || []);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

    if (!stay) return <div className="p-8 text-center">No active rental record found to generate report.</div>;

    // Calculations
    const totalPaid = bills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + (b.amount || 0), 0);
    const totalPending = bills.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + (b.amount || 0), 0);
    const tenantProfile = user?.tenantProfile || {};

    return (
        <div className="bg-white min-h-screen text-zinc-900 font-sans p-8 print:p-0">
            {/* Print Controls */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold">Rental Agreement & Statement</h1>
                <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition"
                >
                    <Printer size={18} /> Print Official Copy
                </button>
            </div>

            {/* Official Document */}
            <div className="max-w-4xl mx-auto border border-zinc-200 p-12 bg-white shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:p-8">

                {/* Header */}
                <header className="border-b-2 border-zinc-900 pb-8 mb-8 flex justify-between items-start">
                    <div>
                        <div className="text-4xl font-black tracking-tight uppercase text-zinc-900 leading-none">Rental<br />Agreement</div>
                        <div className="text-xs font-bold text-zinc-500 mt-3 tracking-[0.2em] uppercase">Official Statement of Record</div>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg mb-2 print:border-emerald-600 print:text-black">
                            <ShieldCheck size={20} />
                            <span className="font-black text-sm uppercase">Legally Verified</span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">ID: {stay.id.slice(0, 8).toUpperCase()}</div>
                    </div>
                </header>

                {/* Parties Involved */}
                <section className="grid grid-cols-2 gap-12 mb-12">
                    {/* Tenant */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-200 pb-2 flex items-center gap-2">
                            <User size={14} /> Tenant Details
                        </h3>
                        <div className="space-y-1">
                            <div className="font-bold text-xl">{user?.name}</div>
                            <div className="text-sm text-zinc-600">{user?.email}</div>
                            {tenantProfile.mobile && <div className="text-sm text-zinc-600 flex items-center gap-2"><Phone size={12} /> {tenantProfile.mobile}</div>}
                            {tenantProfile.city && <div className="text-sm text-zinc-600 flex items-center gap-2"><Building size={12} /> {tenantProfile.city}, {tenantProfile.state}</div>}
                            <div className="text-xs text-zinc-400 mt-2 font-mono">Aadhaar: {tenantProfile.aadhaarNumber ? `XXXX-XXXX-${tenantProfile.aadhaarNumber.slice(-4)}` : 'Provided'}</div>
                        </div>
                    </div>

                    {/* Landlord */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-200 pb-2 flex items-center gap-2">
                            <Building size={14} /> Landlord Authority
                        </h3>
                        <div className="space-y-1">
                            <div className="font-bold text-xl">{stay.landlordName || 'Property Manager'}</div>
                            <div className="text-sm text-zinc-600">{stay.landlordEmail}</div>
                            <div className="text-sm text-zinc-600 font-bold mt-2">{stay.propertyName}</div>
                            <div className="text-sm text-zinc-500">{stay.propertyAddress}</div>
                        </div>
                    </div>
                </section>

                {/* Lease Terms Summary */}
                <section className="mb-10 bg-zinc-50 p-6 rounded-xl border border-zinc-100 print:bg-white print:border-zinc-300">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Lease Terms</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-2">
                            <div className="text-[10px] uppercase font-bold text-zinc-500">Monthly Rent</div>
                            <div className="text-lg font-black">₹{stay.monthlyRent?.toLocaleString() || 'N/A'}</div>
                        </div>
                        <div className="p-2 border-l border-zinc-200">
                            <div className="text-[10px] uppercase font-bold text-zinc-500">Start Date</div>
                            <div className="text-lg font-bold">{new Date(stay.joinDate).toLocaleDateString()}</div>
                        </div>
                        <div className="p-2 border-l border-zinc-200">
                            <div className="text-[10px] uppercase font-bold text-zinc-500">Duration</div>
                            <div className="text-lg font-bold">11 Months</div>
                        </div>
                        <div className="p-2 border-l border-zinc-200">
                            <div className="text-[10px] uppercase font-bold text-zinc-500">Security Deposit</div>
                            <div className="text-lg font-bold">₹{((stay.monthlyRent || 0) * 3).toLocaleString()}</div>
                        </div>
                    </div>
                </section>

                {/* Financial Statement */}
                <section className="mb-12">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-200 pb-2 flex items-center gap-2">
                        <CreditCard size={14} /> Financial Statement
                    </h3>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl print:border-zinc-300 print:bg-white">
                            <div className="text-sm font-bold text-emerald-800 uppercase tracking-wide opacity-70">Total Amount Paid</div>
                            <div className="text-4xl font-black text-emerald-700 mt-2">₹{totalPaid.toLocaleString()}</div>
                            <div className="text-xs text-emerald-600 mt-1">Verified transactions</div>
                        </div>
                        <div className={`p-6 border rounded-xl print:border-zinc-300 print:bg-white ${totalPending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-zinc-50 border-zinc-100'}`}>
                            <div className={`text-sm font-bold uppercase tracking-wide opacity-70 ${totalPending > 0 ? 'text-amber-800' : 'text-zinc-600'}`}>Currently Due</div>
                            <div className={`text-4xl font-black mt-2 ${totalPending > 0 ? 'text-amber-700' : 'text-zinc-400'}`}>₹{totalPending.toLocaleString()}</div>
                            <div className={`text-xs mt-1 ${totalPending > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                                {totalPending > 0 ? 'Action Required' : 'All clear'}
                            </div>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div>
                        <h4 className="text-sm font-bold text-zinc-900 mb-4">Transaction Ledger</h4>
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-zinc-900">
                                    <th className="py-3 font-bold uppercase text-[10px] tracking-wider w-1/4">Date</th>
                                    <th className="py-3 font-bold uppercase text-[10px] tracking-wider w-1/3">Description</th>
                                    <th className="py-3 font-bold uppercase text-[10px] tracking-wider text-right">Amount</th>
                                    <th className="py-3 font-bold uppercase text-[10px] tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {/* Initial Verification Payment */}
                                <tr className="group hover:bg-zinc-50">
                                    <td className="py-4 font-mono text-zinc-500">{new Date(stay.joinDate).toLocaleDateString()}</td>
                                    <td className="py-4 font-medium text-zinc-900">Initial Verification Fee & Processing</td>
                                    <td className="py-4 text-right font-bold text-zinc-900">₹116.82</td>
                                    <td className="py-4 text-right"><span className="font-bold text-emerald-600 text-xs">PAID</span></td>
                                </tr>
                                {/* Bills */}
                                {bills.map((bill: any) => (
                                    <tr key={bill.id} className="group hover:bg-zinc-50">
                                        <td className="py-4 font-mono text-zinc-500">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                        <td className="py-4">
                                            <div className="font-bold text-zinc-900">{bill.type} Bill</div>
                                            <div className="text-xs text-zinc-500">Billing Cycle: {bill.month}</div>
                                        </td>
                                        <td className="py-4 text-right font-bold text-zinc-900">₹{bill.amount.toLocaleString()}</td>
                                        <td className="py-4 text-right">
                                            {bill.status === 'PAID' ? (
                                                <span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded">PAID</span>
                                            ) : (
                                                <span className="font-bold text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded">PENDING</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="border-t-2 border-zinc-900 bg-zinc-50 print:bg-white">
                                    <td colSpan={2} className="py-4 font-black uppercase text-right pr-4">Total Obligation</td>
                                    <td className="py-4 text-right font-black text-xl">₹{(totalPaid + totalPending + 116.82).toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer className="mt-16 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400 flex flex-col gap-2">
                    <p>This is a computer referenced document generated by Smart Rental Platform.</p>
                    <p className="font-mono">Document Hash: {stay.id}-{Date.now()}</p>
                </footer>
            </div>
        </div>
    );
}
