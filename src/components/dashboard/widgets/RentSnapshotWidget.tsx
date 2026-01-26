'use client';
import { IndianRupee, CreditCard, ArrowRight, History, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RentSnapshotWidget({ userId }: { userId: string }) {
    const [stats, setStats] = useState<any>({ amountDue: 0, dueDate: null, nextDue: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tenant/bills?status=PENDING')
            .then(res => res.json())
            .then(data => {
                if (data.bills && data.bills.length > 0) {
                    // Find earliest due
                    const earliest = data.bills.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
                    setStats({
                        amountDue: data.bills.reduce((acc: number, b: any) => acc + b.amount, 0),
                        dueDate: earliest.dueDate,
                        nextDue: earliest.dueDate
                    });
                } else {
                    setStats({ amountDue: 0, dueDate: null, nextDue: null });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    return (
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 flex flex-col justify-between h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <IndianRupee size={24} />
                    </div>
                    {stats.amountDue > 0 ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-rose-100 animate-pulse">
                            Payment Due
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                            All Clear
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Outstanding</p>
                    <h3 className="text-4xl font-bold text-zinc-900 tracking-tight">
                        ₹{stats.amountDue.toLocaleString()}
                    </h3>
                    {stats.dueDate && (
                        <p className="text-rose-600 text-sm font-semibold mt-2 flex items-center gap-1">
                            Due by {new Date(stats.dueDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-zinc-100 flex gap-3">
                {stats.amountDue > 0 ? (
                    <Link href="/tenant/dashboard/bills" className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95">
                        Pay Now <ArrowRight size={14} />
                    </Link>
                ) : (
                    <div className="flex-1 py-3 bg-zinc-50 text-zinc-400 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle size={14} /> Paid
                    </div>
                )}
                <Link href="/tenant/dashboard/bills" className="h-10 w-10 bg-zinc-50 text-zinc-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <History size={18} />
                </Link>
            </div>
        </div>
    );
}
