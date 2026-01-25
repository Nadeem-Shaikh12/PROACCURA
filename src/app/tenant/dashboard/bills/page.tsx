'use client';

import { useEffect, useState } from 'react';
import {
    DollarSign,
    Loader2,
    CheckCircle,
    AlertCircle,
    ReceiptText,
    ArrowLeft,
    Calendar,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function TenantBillsPage() {
    const { user, isLoading } = useAuth();
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) {
            fetchBills();
        }
    }, [user, isLoading]);

    const fetchBills = async () => {
        try {
            const res = await fetch('/api/tenant/bills');
            const data = await res.json();
            if (data.bills) setBills(data.bills);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePayBill = async (billId: string) => {
        if (!confirm('Proceed with payment? This will mark the bill as paid.')) return;

        setPayingId(billId);
        try {
            const res = await fetch('/api/tenant/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId })
            });

            if (res.ok) {
                // Refresh bills to show updated status
                fetchBills();
                // Optional: Show success message/toast
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setPayingId(null);
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-400" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Invoices...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10">
            <header className="mb-8">
                <Link href="/tenant/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-4 transition">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                        <DollarSign size={20} />
                    </div>
                    My Bills & Payments
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">View pending invoices and payment history.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {bills.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
                        <div className="h-24 w-24 bg-zinc-50 text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ReceiptText size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900">All Caught Up!</h3>
                        <p className="text-zinc-500 mt-2 max-w-xs mx-auto">You have no pending bills at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-6 pb-2">
                            <span className="flex-1">Invoice Details</span>
                            <span className="hidden md:block w-32 border-l border-zinc-100 pl-4 text-center">Due Date</span>
                            <span className="w-32 text-right">Action</span>
                        </div>
                        {bills.map(bill => (
                            <div key={bill.id} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner border transition-all duration-500 group-hover:scale-105 ${bill.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                    <CreditCard size={24} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-zinc-900 leading-tight">{bill.type}</h3>
                                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">• {bill.month}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-zinc-400">
                                        <span className="flex items-center gap-1">Amount: <span className="text-zinc-900 font-bold">₹{bill.amount.toLocaleString()}</span></span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-32 text-center border-l border-zinc-50 pl-4">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 items-center gap-1 flex justify-center">
                                        Deadline
                                    </div>
                                    <div className={`text-sm font-bold ${new Date(bill.dueDate) < new Date() && bill.status !== 'PAID' ? 'text-rose-500' : 'text-zinc-900'}`}>
                                        {new Date(bill.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-center md:text-right border-l border-zinc-50 pl-8 min-w-[140px]">
                                    {bill.status === 'PAID' ? (
                                        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-widest">
                                            <CheckCircle size={14} /> Paid
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handlePayBill(bill.id)}
                                            disabled={payingId === bill.id}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                                        >
                                            {payingId === bill.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                'Pay Now'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
