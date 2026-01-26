'use client';
import { FileText, Download, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsWidget({ userId }: { userId: string }) {
    // This would typically fetch recent docs
    // For now we can hardcode relevant links or a mock list
    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" /> Recently Viewed
                    </h3>
                </div>

                <div className="space-y-3">
                    <Link href="/tenant/dashboard/lease" className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition border border-zinc-100/50 group">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-zinc-100">
                                <FileText size={14} />
                            </div>
                            <div>
                                <p className="font-semibold text-xs text-zinc-900">Lease Agreement</p>
                                <p className="text-[10px] text-zinc-500 font-medium">PDF • 2.4 MB</p>
                            </div>
                        </div>
                        <Download size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link href="/tenant/dashboard/community" className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition border border-zinc-100/50 group">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-zinc-100">
                                <FileText size={14} />
                            </div>
                            <div>
                                <p className="font-semibold text-xs text-zinc-900">Community Rules</p>
                                <p className="text-[10px] text-zinc-500 font-medium">Doc • 1.1 MB</p>
                            </div>
                        </div>
                        <Download size={14} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </div>
            <Link href="/tenant/dashboard/documents" className="relative z-10 mt-6 text-[10px] font-semibold uppercase tracking-wider text-center block text-indigo-600 hover:text-indigo-800 transition-colors">
                Open Document Vault
            </Link>
        </div>
    );
}
