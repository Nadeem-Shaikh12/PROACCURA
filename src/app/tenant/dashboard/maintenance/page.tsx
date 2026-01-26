'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MaintenanceRequest, MaintenanceComment } from '@/lib/types';
import {
    Wrench, Plus, AlertTriangle, Clock,
    CheckCircle2, XCircle, ChevronRight,
    MessageSquare, Image as ImageIcon,
    Calendar, MoreVertical, X, Send,
    Trash2,
    Filter
} from 'lucide-react';

const PRIORITY_COLORS = {
    LOW: 'bg-blue-50 text-blue-700 border-blue-100',
    NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-100',
    EMERGENCY: 'bg-red-50 text-red-700 border-red-100 animate-pulse'
};

const STATUS_Styles = {
    OPEN: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Received' },
    IN_PROGRESS: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'In Progress' },
    SCHEDULED: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', label: 'Scheduled' },
    RESOLVED: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Completed' },
    CANCELLED: { color: 'text-zinc-500', bg: 'bg-zinc-100', border: 'border-zinc-200', label: 'Cancelled' }
};

export default function MaintenancePage() {
    const { user, isLoading } = useAuth();
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

    // Modal & Details State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'PLUMBING',
        priority: 'NORMAL',
        images: [] as File[]
    });

    useEffect(() => {
        if (user) fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/maintenance?tenantId=${user?.id}`);
            const data = await res.json();
            if (data.requests) setRequests(data.requests);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Upload Images if any
            const imageUrls: string[] = [];
            for (const file of formData.images) {
                const fd = new FormData();
                fd.append('file', file);
                const upRes = await fetch('/api/documents/upload', { method: 'POST', body: fd });
                const upData = await upRes.json();
                if (upData.url) imageUrls.push(upData.url);
            }

            // 2. Create Request
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                images: imageUrls
            };

            const res = await fetch('/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchRequests();
                setIsCreateOpen(false);
                setFormData({ title: '', description: '', category: 'PLUMBING', priority: 'NORMAL', images: [] });
            }
        } catch (error) {
            console.error(error);
            alert('Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (activeTab === 'ACTIVE') return ['OPEN', 'IN_PROGRESS', 'SCHEDULED'].includes(req.status);
            return ['RESOLVED', 'CANCELLED'].includes(req.status);
        });
    }, [requests, activeTab]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                            <Wrench size={24} />
                        </div>
                        Maintenance
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium ml-1">Report issues and track repairs within your home.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="py-3 px-6 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                >
                    <Plus size={18} /> Report Issue
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-100 flex gap-6">
                {['ACTIVE', 'HISTORY'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === tab
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-zinc-400 hover:text-zinc-600'
                            }`}
                    >
                        {tab === 'ACTIVE' ? 'Active Requests' : 'History'}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-zinc-300">
                        <Wrench size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">No requests found</h3>
                    <p className="text-zinc-500 mt-1">You haven't reported any issues yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map(req => (
                        <div
                            key={req.id}
                            onClick={() => setSelectedRequest(req)}
                            className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex items-start gap-4"
                        >
                            {/* Priority Indicator Line */}
                            <div className={`w-1.5 self-stretch rounded-full ${req.priority === 'EMERGENCY' ? 'bg-red-500' :
                                req.priority === 'HIGH' ? 'bg-orange-500' :
                                    req.priority === 'NORMAL' ? 'bg-emerald-500' : 'bg-blue-400'
                                }`} />

                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-lg group-hover:text-indigo-600 transition-colors">
                                            {req.title}
                                        </h3>
                                        <p className="text-zinc-500 text-sm line-clamp-1 mt-0.5">{req.description}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${STATUS_Styles[req.status].bg} ${STATUS_Styles[req.status].color} ${STATUS_Styles[req.status].border}`}>
                                        {STATUS_Styles[req.status].label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1.5 uppercase">
                                        <AlertTriangle size={14} />
                                        {req.category}
                                    </span>
                                    {req.priority !== 'NORMAL' && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${PRIORITY_COLORS[req.priority]}`}>
                                            {req.priority}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ChevronRight className="text-zinc-300 self-center group-hover:translate-x-1 transition-transform" />
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <h2 className="text-xl font-black text-zinc-900">Report Issue</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full text-zinc-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">What's the issue?</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Leaking Kitchen Sink"
                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none"
                                    >
                                        <option value="PLUMBING">Plumbing</option>
                                        <option value="ELECTRICAL">Electrical</option>
                                        <option value="APPLIANCE">Appliance</option>
                                        <option value="STRUCTURAL">Structural</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none"
                                    >
                                        <option value="LOW">Low (Cosmetic)</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High (Urgent)</option>
                                        <option value="EMERGENCY">Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Please describe the issue in detail..."
                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Photos (Optional)</label>
                                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:bg-zinc-50 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={e => {
                                            if (e.target.files) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: [...prev.images, ...Array.from(e.target.files!)]
                                                }));
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                                        <ImageIcon size={24} />
                                        <span className="text-xs font-bold">Tap to add photos</span>
                                    </div>
                                </div>
                                {formData.images.length > 0 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                        {formData.images.map((file, i) => (
                                            <div key={i} className="h-16 w-16 bg-zinc-100 rounded-lg flex-shrink-0 border border-zinc-200 flex items-center justify-center relative">
                                                <span className="text-[9px] text-zinc-500 px-1 text-center truncate w-full">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-zinc-800 transition shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal (Slide Over style) */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)} />
                    <div className="w-full max-w-xl bg-white h-full relative z-10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 backdrop-blur">
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block ${STATUS_Styles[selectedRequest.status].bg} ${STATUS_Styles[selectedRequest.status].color}`}>
                                    {STATUS_Styles[selectedRequest.status].label}
                                </span>
                                <h2 className="text-2xl font-black text-zinc-900 leading-tight">{selectedRequest.title}</h2>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-zinc-200 rounded-full text-zinc-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Images Carousel */}
                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Attached Visuals</h4>
                                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                                        {selectedRequest.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                alt="Evidence"
                                                className="h-48 w-auto rounded-xl border border-zinc-200 shadow-sm snap-center cursor-pointer hover:opacity-95"
                                                onClick={() => window.open(img, '_blank')}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Category</div>
                                    <div className="font-bold text-zinc-700">{selectedRequest.category}</div>
                                </div>
                                <div className={`p-4 rounded-2xl border ${selectedRequest.priority === 'EMERGENCY' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-zinc-50 border-zinc-100'
                                    }`}>
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Priority</div>
                                    <div className="font-bold">{selectedRequest.priority}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</h4>
                                <p className="text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                    {selectedRequest.description}
                                </p>
                            </div>

                            {/* Comments / Timeline Placeholder */}
                            <div className="border-t border-zinc-100 pt-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageSquare size={18} className="text-indigo-600" />
                                    <h3 className="font-bold text-zinc-900">Updates & Comments</h3>
                                </div>

                                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-0.5 before:bg-zinc-100">
                                    <div className="pl-10 relative">
                                        <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white ring-1 ring-emerald-200"></div>
                                        <div className="bg-white p-3 rounded-xl border border-zinc-100 shadow-sm">
                                            <p className="text-sm font-medium text-zinc-600">Request submitted successfully.</p>
                                            <span className="text-[10px] text-zinc-400 mt-1 block">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {/* Add logic here to map over selectedRequest.comments if any in future */}
                                </div>

                                {/* Add Comment Box */}
                                <div className="mt-8 flex gap-3">
                                    <input
                                        placeholder="Type a message..."
                                        disabled
                                        className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium cursor-not-allowed"
                                    />
                                    <button disabled className="p-3 bg-zinc-200 text-zinc-400 rounded-xl">
                                        <Send size={20} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-400 text-center mt-2">Communication is currently read-only in this demo.</p>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        {selectedRequest.status === 'OPEN' && (
                            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                                <button
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to cancel this request?')) return;
                                        try {
                                            const res = await fetch(`/api/maintenance/${selectedRequest.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ status: 'CANCELLED' })
                                            });
                                            if (res.ok) {
                                                await fetchRequests();
                                                setSelectedRequest(null);
                                            } else {
                                                alert('Failed to delete');
                                            }
                                        } catch (e) { console.error(e); alert('Error cancelling'); }
                                    }}
                                    className="flex-1 py-3 bg-white border border-zinc-200 text-red-600 font-bold rounded-xl shadow-sm hover:bg-red-50 hover:border-red-100 transition"
                                >
                                    Cancel Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
