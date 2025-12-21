import { TenantHistory } from '@/lib/db';
import { Download } from 'lucide-react';

interface Props {
    history: TenantHistory[];
}

export default function LightBillTable({ history }: Props) {
    const bills = history?.filter(h => h.type === 'LIGHT_BILL') || [];

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                <h3 className="font-bold text-zinc-900 dark:text-white">Recent Light Bills</h3>
                <span className="text-xs text-zinc-500">{bills.length} Records</span>
            </div>

            {bills.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">No bill records found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-3">Month</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => (
                                <tr key={bill.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                                    <td className="px-6 py-4 font-medium">
                                        {bill.month ? `${bill.month} ${bill.year}` : new Date(bill.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">₹{bill.amount}</div>
                                        {bill.units && <div className="text-[10px] text-zinc-400 uppercase tracking-tighter">{bill.units} Units</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bill.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                            {bill.status === 'pending' ? 'Pending' : 'Paid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium text-xs flex items-center justify-end gap-1 ml-auto">
                                            <Download size={14} /> Receipt
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
