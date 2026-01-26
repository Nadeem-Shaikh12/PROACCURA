'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type AccentColor = 'blue' | 'violet' | 'emerald' | 'rose' | 'amber' | 'slate';
type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

interface CustomThemeContextType {
    accentColor: AccentColor;
    setAccentColor: (color: AccentColor) => void;
    layoutDensity: LayoutDensity;
    setLayoutDensity: (density: LayoutDensity) => void;
    widgets: Record<string, boolean>;
    toggleWidget: (key: string) => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [accentColor, setAccentColor] = useState<AccentColor>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('accentColor') as AccentColor) || 'blue';
        }
        return 'blue';
    });
    const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('layoutDensity') as LayoutDensity) || 'comfortable';
        }
        return 'comfortable';
    });
    const [widgets, setWidgets] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('dashboardWidgets');
            return stored ? JSON.parse(stored) : {
                financial: true,
                activity: true,
                occupancy: true,
                tasks: true,
                maintenance: true,
                analytics: true,
            };
        }
        return {
            financial: true,
            activity: true,
            occupancy: true,
            tasks: true,
            maintenance: true,
            analytics: true,
        };
    });

    useEffect(() => {
        // Override with User Preferences if logged in
        if (user?.portalPreferences) {
            setAccentColor(prev => user.portalPreferences!.accentColor && user.portalPreferences!.accentColor !== prev ? user.portalPreferences!.accentColor : prev);
            setLayoutDensity(prev => user.portalPreferences!.layoutDensity && user.portalPreferences!.layoutDensity !== prev ? user.portalPreferences!.layoutDensity : prev);
            setWidgets(prev => {
                if (!user.portalPreferences!.dashboardWidgets) return prev;
                const newWidgets = user.portalPreferences!.dashboardWidgets;
                const isDifferent = Object.keys(newWidgets).some(k => newWidgets[k] !== prev[k]) || Object.keys(prev).some(k => newWidgets[k] !== prev[k]);
                return isDifferent ? newWidgets : prev;
            });
        }
    }, [user]);

    useEffect(() => {
        // Apply CSS variable for accent color
        const root = document.documentElement;
        const colorMap: Record<AccentColor, string> = {
            blue: '#4f46e5',    // Indigo-600
            violet: '#7c3aed',  // Violet-600
            emerald: '#059669', // Emerald-600
            rose: '#e11d48',    // Rose-600
            amber: '#d97706',   // Amber-600
            slate: '#0f172a',   // Slate-900
        };
        root.style.setProperty('--primary', colorMap[accentColor]);
        localStorage.setItem('accentColor', accentColor);
    }, [accentColor]);

    useEffect(() => {
        localStorage.setItem('layoutDensity', layoutDensity);
    }, [layoutDensity]);

    useEffect(() => {
        localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    }, [widgets]);

    const toggleWidget = (key: string) => {
        setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <CustomThemeContext.Provider value={{ accentColor, setAccentColor, layoutDensity, setLayoutDensity, widgets, toggleWidget }}>
            {children}
        </CustomThemeContext.Provider>
    );
}

export function useCustomTheme() {
    const context = useContext(CustomThemeContext);
    if (context === undefined) {
        throw new Error('useCustomTheme must be used within a CustomThemeProvider');
    }
    return context;
}
