'use client';
import { IndianRupee, Wrench, FileText, Bell, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ActivityFeedWidget({ userId }: { userId: string }) {
    // Mock Data for now - in production merge notifications + history
    const activities = [
        { id: 1, type: 'PAYMENT', title: 'Rent Paid', date: 'Today', amount: '₹25,000', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 2, type: 'MAINTENANCE', title: 'Ticket #102 Update', date: 'Yesterday', desc: 'Technician assigned', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 3, type: 'DOC', title: 'New Lease Uploaded', date: 'Jan 20', desc: 'Please review', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 4, type: 'NOTIF', title: 'Building Notice', date: 'Jan 18', desc: 'Water maintenance tmrw', icon: Bell, color: 'text-violet-500', bg: 'bg-violet-50' },
    ];

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm h-full">
            <h3 className="font-bold text-zinc-900 text-lg mb-6 flex items-center gap-2">
                Recent Activity
            </h3>
            <div className="relative border-l-2 border-zinc-100 ml-4 space-y-8 pl-8 py-2">
                {activities.map((act) => (
                    <div key={act.id} className="relative group">
                        <div className={`absolute -left-[41px] h-6 w-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${act.bg} ${act.color}`}>
                            <act.icon size={12} />
                        </div>
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-sm text-zinc-900">{act.title}</h4>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{act.date}</span>
                            </div>
                            {act.amount && <p className="text-xs font-black text-emerald-600 mt-1">{act.amount}</p>}
                            {act.desc && <p className="text-xs font-medium text-zinc-500 mt-1">{act.desc}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
