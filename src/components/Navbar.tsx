'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, login, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (pathname === '/login') return null; // Don't show navbar on login page if we had one, but we might just use modals or inline.

    return (
        <nav className="h-16 border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-full items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                            <Building2 className="text-white h-5 w-5" />
                        </div>
                        <span className="font-black text-xl tracking-tighter text-slate-900">
                            Prop<span className="text-blue-600">Accura</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                    <UserIcon size={14} className="text-blue-600" />
                                    <span>{user.name}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    {user.role === 'landlord' ? (
                                        <>
                                            <Link href="/landlord/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                                                Dashboard
                                            </Link>
                                            <Link href="/landlord/messages" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                                                Messages
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/tenant/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                                                Dashboard
                                            </Link>
                                            <Link href="/tenant/messages" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                                                Messages
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                                    aria-label="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                                >
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
