
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Clock, ShieldCheck } from 'lucide-react';

export default function PendingApprovalPage() {
    const { logout, user } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center border border-slate-200">
                <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={40} className="text-amber-500" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">Reference Required</h1>
                <p className="text-slate-500 font-medium mb-8">
                    Welcome, {user?.name}! Your account has been created but requires landlord verification. When you get access from any landlord, only then will you be able to see or access the dashboard features.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        Next Steps
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Please ask your landlord to add you to their property using your email address:
                    </p>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-sm text-center font-bold text-slate-800 select-all">
                        {user?.email}
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full py-4 text-slate-500 hover:text-slate-900 font-bold transition-all"
                >
                    <LogOut size={20} />
                    Sign Out & Check Later
                </button>
            </div>
        </div>
    );
}
