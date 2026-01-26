'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    FileText,
    Download,
    Calendar,
    FolderOpen,
    CreditCard,
    Shield,
    Search,
    Filter,
    ArrowUpDown,
    X,
    Eye,
    MoreVertical,
    Clock,
    HardDrive,
    Upload,
    Tag,
    AlertCircle,
    CheckCircle2,
    Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StoredDocument } from '@/lib/store';

// Helper to format file size
const formatFileSize = (size?: number) => {
    if (!size) return '1.2 MB'; // Fallback
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileTypeDetails = (mimeType?: string) => {
    if (!mimeType) return { label: 'PDF', color: 'text-red-500' };
    if (mimeType.includes('pdf')) return { label: 'PDF', color: 'text-red-600' };
    if (mimeType.includes('image')) return { label: 'IMG', color: 'text-purple-600' };
    if (mimeType.includes('word') || mimeType.includes('document')) return { label: 'DOC', color: 'text-blue-600' };
    return { label: 'FILE', color: 'text-zinc-600' };
};

export default function TenantDocumentsPage() {
    const { user, isLoading } = useAuth();
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ALL' | 'LEASE' | 'ID_PROOF' | 'BILL' | 'OTHER'>('ALL');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

    // Details Panel State
    const [selectedDoc, setSelectedDoc] = useState<StoredDocument | null>(null);

    // Upload Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState('OTHER');
    const [uploadName, setUploadName] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadTags, setUploadTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Delete Confirmation State
    const [docToDelete, setDocToDelete] = useState<StoredDocument | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !user) return;

        setIsUploading(true);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('file', uploadFile);

            const uploadRes = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData // Content-Type header set automatically
            });
            const uploadData = await uploadRes.json();

            if (uploadData.error) throw new Error(uploadData.error);

            // 2. Create Document Record
            const docData = {
                tenantId: user.id,
                landlordId: user.id, // Or handle this differently if sharing
                category: uploadCategory,
                name: uploadName || uploadFile.name,
                url: uploadData.url,
                description: uploadDesc,
                tags: uploadTags,
                expiryDate: expiryDate || undefined,
                size: uploadData.size,
                mimeType: uploadData.mimeType
            };

            const createRes = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docData)
            });

            if (createRes.ok) {
                await fetchDocuments();
                setIsUploadOpen(false);
                resetUploadForm();
            }

        } catch (error) {
            console.error(error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!docToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/documents/${docToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDocuments(documents.filter(d => d.id !== docToDelete.id));
                setDocToDelete(null);
                setSelectedDoc(null);
            } else {
                alert('Failed to delete document.');
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert('An error occurred while deleting.');
        } finally {
            setIsDeleting(false);
        }
    };

    const resetUploadForm = () => {
        setUploadFile(null);
        setUploadCategory('OTHER');
        setUploadName('');
        setUploadDesc('');
        setUploadTags([]);
        setTagInput('');
        setExpiryDate('');
    };

    const addTag = () => {
        if (tagInput.trim() && !uploadTags.includes(tagInput.trim())) {
            setUploadTags([...uploadTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const filteredAndSortedDocs = useMemo(() => {
        let docs = [...documents];

        // 1. Filter by Tab
        if (activeTab !== 'ALL') {
            docs = docs.filter(doc => doc.category === activeTab);
        }

        // 2. Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            docs = docs.filter(doc =>
                doc.name.toLowerCase().includes(lowerQuery) ||
                doc.description?.toLowerCase().includes(lowerQuery) ||
                doc.category.toLowerCase().replace('_', ' ').includes(lowerQuery) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        // 3. Sort
        docs.sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date-asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        return docs;
    }, [documents, activeTab, searchQuery, sortOption]);

    const getIcon = (category: string) => {
        switch (category) {
            case 'LEASE': return <FileText size={24} />;
            case 'ID_PROOF': return <Shield size={24} />;
            case 'BILL': return <CreditCard size={24} />;
            default: return <FolderOpen size={24} />;
        }
    };

    const getColor = (category: string) => {
        switch (category) {
            case 'LEASE': return 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white';
            case 'ID_PROOF': return 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white';
            case 'BILL': return 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white';
            default: return 'bg-zinc-50 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white';
        }
    }

    if (isLoading || loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Archive...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                            <FolderOpen size={24} />
                        </div>
                        Document Archive
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium ml-1">Manage and access your important tenancy records.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex-1 md:flex-none py-3 px-6 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                    >
                        <Upload size={18} />
                        Upload File
                    </button>
                </div>
            </div>

            {/* Navigation & Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-1">
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
                    {[
                        { id: 'ALL', label: 'All Files', icon: FolderOpen },
                        { id: 'LEASE', label: 'Lease', icon: FileText },
                        { id: 'ID_PROOF', label: 'IDs', icon: Shield },
                        { id: 'BILL', label: 'Bills', icon: CreditCard },
                        { id: 'OTHER', label: 'Other', icon: HardDrive }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-zinc-900 text-white shadow-lg ring-2 ring-zinc-900 ring-offset-2'
                                    : 'bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-zinc-300' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & Sort */}
                <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search documents, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium text-sm"
                        />
                    </div>

                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 block cursor-pointer"
                    >
                        <option value="date-desc">Newest</option>
                        <option value="date-asc">Oldest</option>
                        <option value="name-asc">A-Z</option>
                        <option value="name-desc">Z-A</option>
                    </select>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedDocs.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-zinc-50/50 rounded-[32px] border-2 border-dashed border-zinc-200">
                        <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-sm mb-4">
                            <FolderOpen className="text-zinc-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">No documents found</h3>
                        <p className="text-zinc-500 mt-1">Try uploading a new file or adjusting your filters.</p>
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
                        >
                            Upload Document
                        </button>
                    </div>
                ) : (
                    filteredAndSortedDocs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        >
                            {/* Expiry Warning */}
                            {doc.expiryDate && new Date(doc.expiryDate) < new Date() && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                                    <AlertCircle size={10} /> EXPIRED
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${getColor(doc.category)}`}>
                                    {getIcon(doc.category)}
                                </div>
                                <div className="text-right">
                                    <div className="px-2 py-1 rounded-md bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 inline-block">
                                        {doc.category.replace('_', ' ')}
                                    </div>
                                    {doc.tags && doc.tags.length > 0 && (
                                        <div className="flex justify-end gap-1 flex-wrap max-w-[120px]">
                                            {doc.tags.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {doc.tags.length > 2 && <span className="text-[9px] text-zinc-400">+{doc.tags.length - 2}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-bold text-zinc-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1" title={doc.name}>
                                {doc.name}
                            </h3>
                            <p className="text-xs text-zinc-500 mb-4 line-clamp-2 min-h-[2.5em]">
                                {doc.description || 'No description provided.'}
                            </p>

                            <div className="pt-4 border-t border-zinc-50 flex items-center justify-between text-xs text-zinc-400 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                    {formatFileSize(doc.size || (doc.version * 1024 * 100))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setIsUploadOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                <Upload className="text-indigo-600" size={24} />
                                Upload Document
                            </h2>
                            <button onClick={() => !isUploading && setIsUploadOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* File Drop Area */}
                            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${uploadFile ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 hover:border-indigo-400 hover:bg-zinc-50'}`}>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setUploadFile(e.target.files[0]);
                                            setUploadName(e.target.files[0].name.split('.')[0]); // Auto-fill name
                                        }
                                    }}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer block">
                                    {uploadFile ? (
                                        <>
                                            <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                                            <p className="font-bold text-emerald-700 text-sm">{uploadFile.name}</p>
                                            <p className="text-xs text-emerald-600 mt-1">{formatFileSize(uploadFile.size)}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                                                <Upload size={20} />
                                            </div>
                                            <p className="font-bold text-zinc-700 text-sm">Click to select file</p>
                                            <p className="text-xs text-zinc-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Category</label>
                                    <select
                                        value={uploadCategory}
                                        onChange={(e) => setUploadCategory(e.target.value)}
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                    >
                                        <option value="LEASE">Lease Agreement</option>
                                        <option value="ID_PROOF">ID Proof</option>
                                        <option value="BILL">Bill / Invoice</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Expiry Date <span className="text-zinc-300 font-normal">(Optional)</span></label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Document Name</label>
                                <input
                                    type="text"
                                    value={uploadName}
                                    onChange={(e) => setUploadName(e.target.value)}
                                    placeholder="e.g. Rent Agreement 2026"
                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Tags</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {uploadTags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                            #{tag}
                                            <button type="button" onClick={() => setUploadTags(uploadTags.filter((_, idx) => idx !== i))}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add tag and press Enter"
                                        className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={uploadDesc}
                                    onChange={(e) => setUploadDesc(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
                                    placeholder="Add notes about this document..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!uploadFile || isUploading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${!uploadFile || isUploading
                                        ? 'bg-zinc-300 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] shadow-indigo-200'
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        Upload Document
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {docToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setDocToDelete(null)} />
                    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mb-2">Delete Document?</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Are you sure you want to delete <strong className="text-zinc-900">{docToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDocToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-zinc-100 text-zinc-700 rounded-xl font-bold hover:bg-zinc-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal / Panel - Updated with new metadata */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm bg-white border border-zinc-100 text-zinc-600`}>
                                    {getIcon(selectedDoc.category)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                                            {selectedDoc.category.replace('_', ' ')}
                                        </span>
                                        {selectedDoc.tags?.map((tag, i) => (
                                            <span key={i} className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h2 className="text-2xl font-black text-zinc-900 line-clamp-1">{selectedDoc.name}</h2>
                                    <p className="text-sm text-zinc-500 font-medium">Uploaded on {new Date(selectedDoc.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="p-2 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8">
                            {/* Key Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Type</div>
                                    <div className={`font-bold ${getFileTypeDetails(selectedDoc.mimeType).color}`}>
                                        {getFileTypeDetails(selectedDoc.mimeType).label}
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Size</div>
                                    <div className="font-bold text-zinc-700">{formatFileSize(selectedDoc.size || (selectedDoc.version * 1024 * 100))}</div>
                                </div>

                                {selectedDoc.expiryDate ? (
                                    <div className={`p-4 rounded-2xl border border-zinc-100 ${new Date(selectedDoc.expiryDate) < new Date() ? 'bg-red-50 border-red-100' : 'bg-zinc-50'}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${new Date(selectedDoc.expiryDate) < new Date() ? 'text-red-400' : 'text-zinc-400'}`}>Expires</div>
                                        <div className={`font-bold ${new Date(selectedDoc.expiryDate) < new Date() ? 'text-red-600' : 'text-zinc-700'}`}>
                                            {new Date(selectedDoc.expiryDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Expiry</div>
                                        <div className="font-bold text-zinc-400 text-xs mt-0.5">N/A</div>
                                    </div>
                                )}

                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</div>
                                    <div className="font-bold text-emerald-600 flex items-center gap-1">
                                        Active
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 mb-2">Description</h3>
                                <p className="text-zinc-600 leading-relaxed text-sm">
                                    {selectedDoc.description || "No description provided for this file."}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => window.open(selectedDoc.url, '_blank')}
                                    className="flex-1 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                                >
                                    <Eye size={20} /> Preview File
                                </button>
                                <button
                                    onClick={() => window.open(selectedDoc.url, '_blank')}
                                    className="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
                                >
                                    <Download size={20} /> Download
                                </button>

                                {/* DELETE BUTTON - Only if Uploader */}
                                {selectedDoc.uploadedBy === user?.id && (
                                    <button
                                        onClick={() => setDocToDelete(selectedDoc)}
                                        className="py-4 px-6 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                                        title="Delete this document"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
