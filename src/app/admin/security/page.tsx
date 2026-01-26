'use client';

import { useAuth } from '@/context/AuthContext';
import {
    ShieldAlert,
    Monitor,
    MapPin,
    Clock,
    CheckCircle2,
    Smartphone,
    Laptop,
    Shield
} from 'lucide-react';
import { format } from 'date-fns';

export default function SecurityPage() {
    const { user } = useAuth();
    const loginHistory = user?.securitySettings?.loginHistory || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Shield size={10} /> Internal Security
                    </span>
                </div>
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight italic">Security Audit Log</h1>
                <p className="text-zinc-500 font-medium">Monitor all administrative access sessions and login attempts.</p>
            </div>

            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                        <ShieldCheck size={24} />
                    </div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Auth Status</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tight italic">Verified Admin</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Multi-Factor</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tight italic">Password Only</p>
                    <button className="mt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Enable 2FA</button>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm border-l-4 border-l-rose-500">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-rose-600">
                        <ShieldAlert size={24} />
                    </div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Threat Level</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tight italic">Stable (Low)</p>
                </div>
            </div>

            {/* Login History */}
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative border border-white/5">
                <div className="absolute top-0 right-0 p-8">
                    <Monitor size={120} className="text-white/5 -rotate-12" />
                </div>

                <div className="relative">
                    <h2 className="text-xl font-black text-white tracking-widest uppercase mb-8 flex items-center gap-3">
                        <Monitor className="text-indigo-400 text-xs" /> Session History
                    </h2>

                    <div className="space-y-4">
                        {loginHistory.length > 0 ? loginHistory.map((login: any, idx: number) => (
                            <div
                                key={idx}
                                className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${idx === 0 ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
                                        {login.device.toLowerCase().includes('mobile') || login.device.toLowerCase().includes('android') || login.device.toLowerCase().includes('iphone') ? (
                                            <Smartphone size={20} />
                                        ) : (
                                            <Laptop size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-white uppercase tracking-tighter">
                                                {idx === 0 ? 'Current Session' : 'Previous Access'}
                                            </p>
                                            {idx === 0 && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-widest mt-1">
                                            <MapPin size={10} /> {login.ip} • <Clock size={10} /> {format(new Date(login.date), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Device Data</p>
                                    <p className="text-[10px] font-medium text-zinc-300 max-w-[200px] truncate opacity-50">{login.device}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center">
                                <p className="text-zinc-500 font-black uppercase tracking-widest">No Security Records found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-zinc-500">Global Security Node: IN-WEST-01</span>
                        <span className="text-zinc-500 italic">Auto-Sync Active (45ms)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldCheck({ size, className }: { size?: number, className?: string }) {
    return <Shield size={size} className={className} />;
}
