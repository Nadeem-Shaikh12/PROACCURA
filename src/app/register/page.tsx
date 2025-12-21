'use client';

import { useState } from 'react';
import { useAuth, Role } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('tenant');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register({ name, email, password, role });
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-white">Create an Account</h2>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">I am a</label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setRole('tenant')}
                                className={`py-2 text-sm font-medium rounded-md transition-colors ${role === 'tenant' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                            >
                                Tenant
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('landlord')}
                                className={`py-2 text-sm font-medium rounded-md transition-colors ${role === 'landlord' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                            >
                                Landlord
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Role cannot be changed after registration.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                        Register
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-zinc-500">
                    Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
