import { TenantHistory } from '@/lib/db';
import { Clock, Zap, Home, FileText, CheckCircle, LogOut } from 'lucide-react';

interface Props {
    history: TenantHistory[];
}

export default function TenantHistoryTimeline({ history }: Props) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center p-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <Clock className="mx-auto mb-2 opacity-50" size={24} />
                <p>No history records yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pl-2 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 sm:ml-6">
            {history.map((record) => (
                <div key={record.id} className="relative pl-8 sm:pl-10 animate-in slide-in-from-left-4 duration-500">
                    {/* Timeline Dot */}
                    <div className={`
                        absolute -left-[26px] sm:-left-[31px] top-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center shadow-sm
                        ${record.type === 'JOINED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : ''}
                        ${record.type === 'LIGHT_BILL' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                        ${record.type === 'REMARK' ? 'bg-zinc-50 text-zinc-600 border-zinc-100' : ''}
                        ${record.type === 'RENT_PAYMENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                        ${record.type === 'MOVE_OUT' ? 'bg-red-50 text-red-600 border-red-100' : ''}
                    `}>
                        {record.type === 'JOINED' && <Home size={18} />}
                        {record.type === 'LIGHT_BILL' && <Zap size={18} />}
                        {record.type === 'REMARK' && <FileText size={18} />}
                        {record.type === 'RENT_PAYMENT' && <CheckCircle size={18} />}
                        {record.type === 'MOVE_OUT' && <LogOut size={18} />}
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {record.amount && (
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${record.status === 'pending' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    ₹{record.amount}
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                            {record.type === 'LIGHT_BILL' && record.month ? `Light Bill for ${record.month} ${record.year}` : record.description}
                        </h4>
                        {record.type === 'LIGHT_BILL' && (
                            <div className={`mt-2 flex items-center gap-2 text-xs font-medium ${record.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {record.status === 'pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                {record.status === 'pending' ? 'Payment Pending' : 'Paid'}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
