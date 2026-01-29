'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'landlord' | 'tenant' | 'admin';

import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (data: any) => Promise<any>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    verifyMfa: (code: string, mfaToken: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAuth = async () => {
        try {
            // First check status to ensure not revoked
            const statusRes = await fetch('/api/auth/check-status');
            const statusData = await statusRes.json();

            if (statusRes.status === 403 && statusData.revoked) {
                // Clear the cookie so they are truly logged out and can register again
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/access-revoked');
                setUser(null);
                return;
            }

            if (statusRes.ok && statusData.status === 'inactive') {
                router.push('/tenant/pending');
                // We still set the user so they are "logged in" but stuck on pending page
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
                return;
            }

            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (formData: any) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.mfaRequired) {
                return data;
            }

            setUser(data.user);

            const landingPage = data.user.portalPreferences?.landingPage || 'dashboard';
            if (data.user.role === 'tenant') {
                if (landingPage === 'payments') router.push('/tenant/dashboard/bills');
                else if (landingPage === 'messages') router.push('/tenant/messages');
                else router.push('/tenant/dashboard');
            } else if (data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push(`/${data.user.role}/dashboard`);
            }
            return data;
        } catch (error: any) {
            console.error('Login error', error);
            throw error;
        }
    };

    const register = async (formData: any) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setUser(data.user);
            if (data.user.role === 'admin') router.push('/admin');
            else router.push(`/${data.user.role}/dashboard`);
        } catch (error: any) {
            console.error('Registration error', error);
            throw error;
        }
    };

    const verifyMfa = async (code: string, mfaToken: string) => {
        try {
            const res = await fetch('/api/auth/verify-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, mfaToken }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'MFA Verification failed');
            }

            setUser(data.user);
            if (data.user.role === 'admin') router.push('/admin');
            else router.push(`/${data.user.role}/dashboard`);
        } catch (error: any) {
            console.error('MFA Verification error', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser: checkAuth, verifyMfa, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
