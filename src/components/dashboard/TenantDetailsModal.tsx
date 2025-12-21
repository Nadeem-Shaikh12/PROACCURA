'use client';

import { X, MapPin, Phone, Calendar, Shield, BadgeCheck, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface VerificationRequest {
    id: string;
    fullName: string;
    mobile: string;
    idProofType: string;
    idProofNumber: string;
    city: string;
    status: 'pending' | 'approved' | 'rejected' | 'moved_out';
    joiningDate?: string;
}

interface TenantDetailsModalProps {
    request: VerificationRequest;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function TenantDetailsModal({ request, onClose, onUpdate }: TenantDetailsModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleAction = async (status: 'approved' | 'rejected') => {
        setProcessing(true);
        try {
            const res = await fetch('/api/landlord/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: request.id, status })
            });
            if (res.ok) {
                onUpdate?.();
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">

                {/* Header */}
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
                            {request.fullName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                {request.fullName}
                                {request.status === 'approved' && <BadgeCheck className="text-indigo-600" size={18} fill="currentColor" />}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{request.status} request</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-rose-500 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Mobile</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Phone size={14} className="text-zinc-300" />
                                {request.mobile}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Identity Proof</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Shield size={14} className="text-zinc-300" />
                                {request.idProofType}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ID Number</p>
                            <div className="font-bold text-sm">
                                {request.idProofNumber}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Joined Date</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Calendar size={14} className="text-zinc-300" />
                                {request.joiningDate ? new Date(request.joiningDate).toLocaleDateString() : 'Not Set'}
                            </div>
                        </div>
                    </div>

                    {/* Verification Actions */}
                    {request.status === 'pending' && (
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => handleAction('approved')}
                                disabled={processing}
                                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <CheckCircle size={14} /> Approve Verified
                            </button>
                            <button
                                onClick={() => handleAction('rejected')}
                                disabled={processing}
                                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
                            >
                                <XCircle size={14} /> Decline
                            </button>
                        </div>
                    )}

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center italic">Professional Verification Protocol</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
