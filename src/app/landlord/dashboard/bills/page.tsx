'use client';

import { useEffect, useState } from 'react';
import {
    DollarSign,
    Plus,
    Calendar,
    User as UserIcon,
    Loader2,
    CheckCircle,
    AlertCircle,
    ReceiptText,
    ChevronRight,
    ArrowLeft,
    X,
    Building2,
    Filter,
    CreditCard,
    Repeat,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function BillsPage() {
    const { user, isLoading } = useAuth();
    const [bills, setBills] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [selectedTenant, setSelectedTenant] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('RENT');
    const [dueDate, setDueDate] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) {
            Promise.all([fetchBills(), fetchTenants()]).finally(() => setLoading(false));
        }
    }, [user, isLoading]);

    const fetchBills = async () => {
        try {
            const res = await fetch('/api/landlord/bills');
            const data = await res.json();
            if (data.bills) setBills(data.bills);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchTenants = async () => {
        const res = await fetch('/api/landlord/tenants');
        const data = await res.json();
        if (data.tenants) setTenants(data.tenants);
    };

    const handleCreateBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;

        const tenant = tenants.find(t => t.tenantId === selectedTenant);
        if (!tenant) return;

        setLoading(true);
        try {
            await fetch('/api/landlord/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: tenant.tenantId,
                    stayId: tenant.id,
                    amount,
                    type,
                    dueDate,
                    month
                })
            });
            setIsCreating(false);
            fetchBills();
            setAmount('');
            setDueDate('');
            setMonth('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBill = async (billId: string) => {
        if (!confirm('Are you sure you want to remove this bill? This action cannot be undone.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/landlord/bills?id=${billId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchBills();
            } else {
                alert('Failed to delete bill');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || (loading && bills.length === 0)) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-400" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Ledgers...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-4">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                            <CreditCard size={20} />
                        </div>
                        Invoicing & Ledger
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Generate rent invoices and track payment history for all assets.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Create Invoice
                </button>
            </header>

            {/* Bill Creation Overlay */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-white mb-1">New Transaction</h3>
                                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Billing detail entry</p>
                            </div>
                            <button onClick={() => setIsCreating(false)} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBill} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Recipient Resident</label>
                                    <select
                                        value={selectedTenant}
                                        onChange={(e) => setSelectedTenant(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Select a resident...</option>
                                        {tenants.map(t => (
                                            <option key={t.tenantId} value={t.tenantId}>{t.tenantName} — {t.propertyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Billing Category</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all appearance-none"
                                    >
                                        <option value="RENT">Monthly Rent</option>
                                        <option value="ELECTRICITY">Electricity Bill</option>
                                        <option value="WATER">Water Supply</option>
                                        <option value="MAINTENANCE">Society Maintenance</option>
                                        <option value="OTHER">Miscellaneous</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Invoice Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Cycle (e.g. Jan 2025)</label>
                                    <input
                                        type="text"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        placeholder="January 2025"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-zinc-900 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                Dispatch Invoice
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {bills.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
                        <div className="h-24 w-24 bg-zinc-50 text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ReceiptText size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900">Ledger is Empty</h3>
                        <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Generate your first invoice to begin tracking rental income.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-6 pb-2">
                            <span className="flex-1">Invoice Details</span>
                            <span className="hidden md:block w-32 border-l border-zinc-100 pl-4 text-center">Due Date</span>
                            <span className="w-32 text-right">Settlement</span>
                        </div>
                        {bills.map(bill => (
                            <div key={bill.id} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 group">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner border transition-all duration-500 group-hover:scale-105 ${bill.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    <DollarSign size={24} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-indigo-600 transition">{bill.type}</h3>
                                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">• {bill.month}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-zinc-400">
                                        <span className="flex items-center gap-1"><UserIcon size={12} className="text-indigo-400" /> Resident: {tenants.find(t => t.tenantId === bill.tenantId)?.tenantName || bill.tenantId.substring(0, 8)}</span>
                                        <span className="hidden sm:inline opacity-30">|</span>
                                        <span className="flex items-center gap-1 font-bold"><Building2 size={12} className="text-amber-400" /> Invoiced by SmartRent Ledger</span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-32 text-center border-l border-zinc-50 pl-4">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 items-center gap-1 flex justify-center">
                                        Deadline
                                    </div>
                                    <div className="text-sm font-bold text-zinc-900">{new Date(bill.dueDate).toLocaleDateString()}</div>
                                </div>
                                <div className="text-center md:text-right border-l border-zinc-50 pl-8 flex items-center gap-6">
                                    <div>
                                        <div className="text-2xl font-bold text-zinc-900 tracking-tighter mb-2">₹{bill.amount.toLocaleString()}</div>
                                        {bill.status === 'PAID' ? (
                                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
                                                <CheckCircle size={12} /> Settled
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-100 uppercase tracking-widest animate-pulse">
                                                <AlertCircle size={12} /> Unpaid
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBill(bill.id)}
                                        className="p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group/trash"
                                        title="Delete Invoice"
                                    >
                                        <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
                {/* Automation Section */}
                <section className="pt-8 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                <Repeat className="text-indigo-600" /> Rent Auto-Pilot
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Configure automated rent collection cycles.</p>
                        </div>
                        <button onClick={() => alert('Feature incoming: Batch Automation')} className="text-sm font-bold text-indigo-600 underline">
                            Manage All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* New Schedule Card */}
                        <div className="p-6 rounded-[32px] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center gap-4 hover:bg-zinc-50 transition cursor-pointer group">
                            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900">Set New Schedule</h3>
                                <p className="text-xs text-zinc-500 mt-1">Automate monthly invoicing</p>
                            </div>
                        </div>

                        {/* MOCK Schedule Card */}
                        <div className="bg-zinc-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Calendar size={80} />
                            </div>
                            <div className="relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Repeat size={20} />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                                        Active
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">jane@rental.com</h3>
                                <div className="text-white/60 text-xs font-medium uppercase tracking-widest mb-4">Apartment #102</div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Amount</div>
                                        <div className="font-bold text-lg">₹25,000</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Next Run</div>
                                        <div className="font-bold text-lg">Jan 01</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
