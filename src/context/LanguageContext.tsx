'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from '@/locales/en';
import { hi } from '@/locales/hi';
import { mr } from '@/locales/mr';
import { useAuth } from './AuthContext';

type Language = 'en' | 'hi' | 'mr';
export type TranslationKey = string; // In a stricter version, we could use keyof typeof en

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
    en,
    hi,
    mr
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to English, but could check localStorage or navigator.language in the future
    const [language, setLanguage] = useState<Language>('en');
    const { user } = useAuth();

    // Sync with User Profile or LocalStorage
    useEffect(() => {
        if (user?.language && ['en', 'hi', 'mr'].includes(user.language)) {
            setLanguage(user.language as Language);
            localStorage.setItem('app-language', user.language);
        } else {
            const saved = localStorage.getItem('app-language');
            if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
                setLanguage(saved as Language);
            }
        }
    }, [user]);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = (key: TranslationKey): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if translation missing
                let fallback: any = translations['en'];
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fk in fallback) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found
                    }
                }
                return fallback !== undefined ? fallback : key;
            }
        }

        return value !== undefined ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
