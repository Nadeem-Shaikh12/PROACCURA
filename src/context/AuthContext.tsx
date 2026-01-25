'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'landlord' | 'tenant';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    profilePhoto?: string;
    mobile?: string;
    language?: string;
    timezone?: string;
    notificationPreferences?: {
        rentReminders: boolean;
        maintenanceUpdates: boolean;
        leaseRenewal: boolean;
        messages: boolean;
        documents: boolean;
    };
    portalPreferences?: {
        theme: 'light' | 'dark' | 'system';
        landingPage: 'dashboard' | 'payments' | 'messages';
        emailFormat: 'html' | 'text';
    };
    securitySettings?: {
        twoFactorEnabled: boolean;
        lastLogin?: string;
        loginHistory?: { date: string; device: string; ip: string }[];
    };
    privacySettings?: {
        dataSharing: boolean;
        marketing: boolean;
    };
    tenantProfile?: {
        mobile?: string;
        [key: string]: any;
    };
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
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

            setUser(data.user);

            const landingPage = data.user.portalPreferences?.landingPage || 'dashboard';
            if (data.user.role === 'tenant') {
                if (landingPage === 'payments') router.push('/tenant/dashboard/bills');
                else if (landingPage === 'messages') router.push('/tenant/messages');
                else router.push('/tenant/dashboard');
            } else {
                router.push(`/${data.user.role}/dashboard`);
            }
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
            router.push(`/${data.user.role}/dashboard`);
        } catch (error: any) {
            console.error('Registration error', error);
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
        <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser: checkAuth, isLoading }}>
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
