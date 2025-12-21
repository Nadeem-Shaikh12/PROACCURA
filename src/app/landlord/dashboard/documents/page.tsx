'use client';

import { useEffect, useState } from 'react';
import {
    FileText,
    Plus,
    Search,
    Download,
    Calendar,
    CheckCircle2,
    Clock,
    X,
    UploadCloud,
    User,
    FolderOpen,
    CreditCard,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StoredDocument } from '@/lib/store';

export default function LandlordDocumentsPage() {
    const { user, isLoading } = useAuth();
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'LEASE' | 'ID_PROOF' | 'BILL' | 'OTHER'>('ALL');

    // New Document Form State
    const [newDoc, setNewDoc] = useState({
        tenantName: '', // For UI only, we'd need a real tenant selector in prod
        tenantId: 'tenant-1', // Mock default
        category: 'LEASE',
        name: '',
        description: ''
    });

    useEffect(() => {
        if (!isLoading && !user) {
            window.location.href = '/login';
            return;
        }
        if (user) fetchDocuments();
    }, [user, isLoading]);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/documents?userId=${user?.id}&role=landlord`);
            const data = await res.json();
            if (data.documents) setDocuments(data.documents);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: newDoc.tenantId,
                    landlordId: user?.id,
                    category: newDoc.category,
                    name: newDoc.name,
                    description: newDoc.description,
                    url: '#' // Mock URL
                })
            });
            if (res.ok) {
                setIsAdding(false);
                fetchDocuments();
                alert('Document uploaded successfully');
            }
        } catch (e) {
            alert('Failed to upload document');
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'ALL' || doc.category === activeTab;
        return matchesSearch && matchesTab;
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
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Documents...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                            <FolderOpen size={20} />
                        </div>
                        Document Center
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Manage all tenant records and files.</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-1 max-w-xs bg-white border border-zinc-100 rounded-2xl px-5 py-3 shadow-sm focus-within:ring-2 ring-indigo-500/10 transition-all">
                        <Search className="text-zinc-400 mr-3" size={18} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:text-zinc-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-zinc-200 active:scale-95 group"
                    >
                        <UploadCloud size={16} /> Upload
                    </button>
                </div>
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

            {/* Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">Upload Document</h3>
                                <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Secure Storage</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddDocument} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Document Name</label>
                                    <input
                                        placeholder="e.g. Lease 2024, Aadhaar Card"
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                                        value={newDoc.name}
                                        onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Category</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all appearance-none"
                                            value={newDoc.category}
                                            onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                                        >
                                            <option value="LEASE">Lease Agreement</option>
                                            <option value="ID_PROOF">ID Proof</option>
                                            <option value="BILL">Bill / Invoice</option>
                                            <option value="report">Report</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Tenant (Mock)</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-bold text-sm transition-all appearance-none"
                                            value={newDoc.tenantId}
                                            onChange={e => setNewDoc({ ...newDoc, tenantId: e.target.value })}
                                        >
                                            <option value="tenant-1">Jane Tenant</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea
                                        placeholder="Optional details..."
                                        className="w-full px-5 py-3.5 bg-zinc-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 outline-none font-medium text-sm transition-all h-24 resize-none"
                                        value={newDoc.description}
                                        onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                                    />
                                </div>
                                <div className="p-6 border-2 border-dashed border-zinc-200 rounded-2xl text-center hover:bg-zinc-50 transition cursor-pointer group">
                                    <UploadCloud className="mx-auto text-zinc-300 group-hover:text-indigo-500 transition-colors mb-2" size={32} />
                                    <p className="text-xs font-bold text-zinc-500">Click to upload file</p>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-zinc-900 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                                Save Document
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Grid */}
            <div className="grid gap-4">
                {filteredDocs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="text-zinc-300" size={32} />
                        </div>
                        <h3 className="font-bold text-zinc-900">No Documents Found</h3>
                        <p className="text-zinc-500 text-sm mt-1">Upload files to get started.</p>
                    </div>
                ) : (
                    filteredDocs.map(doc => (
                        <div key={doc.id} className="group bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-14 w-14 bg-zinc-50 text-zinc-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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

                            <div className="flex items-center gap-8 text-sm">
                                <div>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Uploaded</div>
                                    <div className="font-bold text-zinc-700 flex items-center gap-2">
                                        <Calendar size={14} className="text-zinc-400" />
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-900 hover:text-white transition-colors">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
