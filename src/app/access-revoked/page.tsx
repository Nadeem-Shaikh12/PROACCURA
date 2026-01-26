
'use client';

import Link from 'next/link';
import { XCircle, Lock, ArrowLeft } from 'lucide-react';

export default function AccessRevokedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center border border-slate-200">
                <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={40} className="text-rose-500" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-2">Access Revoked</h1>
                <p className="text-slate-500 font-medium mb-8">
                    Your account access has been revoked by the status administrator. You can no longer access the dashboard or tenant features.
                </p>

                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-8 text-left flex gap-3">
                    <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-rose-800 font-medium">
                        If you believe this is an error, please contact your landlord directly or the platform support team.
                    </p>
                </div>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                    <ArrowLeft size={20} />
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
