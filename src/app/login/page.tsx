'use client';

import { useState } from 'react';
import { useAuth, Role } from '@/context/AuthContext';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
    const { login, verifyMfa } = useAuth();
    useRedirectIfAuthenticated();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('tenant');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // MFA States
    const [showMfa, setShowMfa] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaToken, setMfaToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await login({ email, password, role });
            if (result?.mfaRequired) {
                setMfaToken(result.mfaToken);
                setShowMfa(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMfaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await verifyMfa(mfaCode, mfaToken);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-black relative">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>
            {/* Left Side - Visual (Same as before) */}
            <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 max-w-lg space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-lg p-3 rounded-xl w-fit border border-white/20"
                    >
                        <Building2 className="h-8 w-8" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tighter italic uppercase"
                    >
                        Security Protocol <br />
                        <span className="text-white/50 lowercase font-normal italic">Authorized Access Only</span>
                    </motion.h1>
                    <p className="text-indigo-100 font-medium leading-relaxed">
                        Establishing a secure connection to the ProAccura Management Hub. Please verify your identity to proceed.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-zinc-50 dark:bg-zinc-950">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-sm space-y-8"
                >
                    {!showMfa ? (
                        <>
                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">{t('loginPage.welcomeTitle')}</h2>
                                <p className="text-zinc-500 font-medium">{t('loginPage.welcomeSubtitle')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t('loginPage.roleLabel')}</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setRole('tenant')}
                                            className={`py-2.5 text-xs font-bold rounded-lg transition-all ${role === 'tenant' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                        >
                                            {t('loginPage.roles.tenant')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('landlord')}
                                            className={`py-2.5 text-xs font-bold rounded-lg transition-all ${role === 'landlord' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                        >
                                            {t('loginPage.roles.landlord')}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5">{t('loginPage.emailLabel')}</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-1.5">{t('loginPage.passwordLabel')}</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-zinc-900/10 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Processing...' : (
                                        <>{t('loginPage.submitButton')} <ArrowRight size={14} /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-2 text-center lg:text-left">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                                    <Building2 size={24} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Verification</h2>
                                <p className="text-zinc-500 font-medium">Please enter the 6-digit code sent to your mobile device.</p>
                            </div>

                            <form onSubmit={handleMfaSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">6-Digit Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        className="w-full px-4 py-5 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                                        placeholder="000000"
                                        value={mfaCode}
                                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || mfaCode.length !== 6}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Verifying...' : 'Unlock Portal'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowMfa(false)}
                                    className="w-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
                                >
                                    Cancel & Return
                                </button>
                            </form>
                        </div>
                    )}

                    <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {t('loginPage.noAccount')}{' '}
                        <Link href="/register" className="text-indigo-600 hover:text-indigo-500 underline decoration-2 underline-offset-4">
                            {t('loginPage.createAccount')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
