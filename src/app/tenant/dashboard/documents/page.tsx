'use client';

import { useEffect, useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    FolderOpen,
    CreditCard,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StoredDocument } from '@/lib/store';

export default function TenantDocumentsPage() {
    const { user, isLoading } = useAuth();
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ALL' | 'LEASE' | 'ID_PROOF' | 'BILL' | 'OTHER'>('ALL');

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchDocuments();
    }, [user, isLoading]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/documents?userId=${user?.id}&role=tenant`);
            const data = await res.json();
            if (data.documents) setDocuments(data.documents);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesTab = activeTab === 'ALL' || doc.category === activeTab;
        return matchesTab;
    });

    const getIcon = (category: string) => {
        switch (category) {
            case 'LEASE': return <FileText size={20} />;
            case 'ID_PROOF': return <Shield size={20} />;
            case 'BILL': return <CreditCard size={20} />;
            default: return <FolderOpen size={20} />;
        }
    };

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Archive...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                        <FolderOpen size={20} />
                    </div>
                    My Document Archive
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">Access your digital leases, bills, and records.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'LEASE', 'ID_PROOF', 'BILL', 'OTHER'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                            : 'bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100'
                            }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredDocs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-zinc-100">
                        <FolderOpen className="mx-auto text-zinc-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-zinc-900">Archive Empty</h3>
                        <p className="text-zinc-500">No documents have been shared with you yet.</p>
                    </div>
                ) : (
                    filteredDocs.map(doc => (
                        <div key={doc.id} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 group">
                            <div className="flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-zinc-50 text-zinc-500 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {getIcon(doc.category)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border border-zinc-200">
                                                {doc.category.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-medium text-zinc-400">v{doc.version}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-zinc-900">{doc.name}</h3>
                                        {doc.description && <p className="text-xs text-zinc-500 line-clamp-1">{doc.description}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                <div className="text-right hidden md:block">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Date Added</div>
                                    <div className="font-bold text-zinc-700 flex items-center justify-end gap-2 text-sm">
                                        <Calendar size={14} className="text-zinc-400" />
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <button className="flex-1 md:flex-none px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-900 hover:text-white transition flex items-center justify-center gap-2">
                                    <Download size={16} /> <span className="md:hidden">Download</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
