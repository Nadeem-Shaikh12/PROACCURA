'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Moon, Sun, Smartphone, Layout, Palette, Grid, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { useCustomTheme } from '@/context/CustomThemeContext';

export default function ThemeSettingsPage() {
    const { user, setUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { accentColor, setAccentColor, layoutDensity, setLayoutDensity, widgets, toggleWidget } = useCustomTheme();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portalPreferences: {
                        ...user?.portalPreferences,
                        theme: theme as any,
                        accentColor,
                        layoutDensity,
                        dashboardWidgets: widgets
                    }
                })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Theme preferences saved and applied!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save theme preferences');
        } finally {
            setLoading(false);
        }
    };

    const colors = [
        { name: 'Blue', value: 'blue', class: 'bg-indigo-600' },
        { name: 'Violet', value: 'violet', class: 'bg-violet-600' },
        { name: 'Emerald', value: 'emerald', class: 'bg-emerald-600' },
        { name: 'Rose', value: 'rose', class: 'bg-rose-600' },
        { name: 'Amber', value: 'amber', class: 'bg-amber-600' },
        { name: 'Slate', value: 'slate', class: 'bg-slate-900' },
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Theme & Dashboard</h1>
                <p className="text-zinc-500">Personalize your visual experience and dashboard layout.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Theme Selection */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden p-6 h-fit">
                    <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Palette size={18} /> Interface Theme
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setTheme('light')}
                            className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition ${theme === 'light' ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
                        >
                            <Sun size={20} className={theme === 'light' ? 'text-zinc-900' : 'text-zinc-400'} />
                            <span className="text-xs font-medium">Light</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
                        >
                            <Moon size={20} className={theme === 'dark' ? 'text-white' : 'text-zinc-400'} />
                            <span className="text-xs font-medium">Dark</span>
                        </button>
                        <button
                            onClick={() => setTheme('system')}
                            className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition ${theme === 'system' ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
                        >
                            <Smartphone size={20} className={theme === 'system' ? 'text-zinc-900' : 'text-zinc-400'} />
                            <span className="text-xs font-medium">Auto</span>
                        </button>
                    </div>
                </div>

                {/* 4. Accent Color */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden p-6 h-fit">
                    <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${colors.find(c => c.value === accentColor)?.class || 'bg-blue-600'}`}></div>
                        Brand & Accent Color
                    </h3>
                    <p className="text-xs text-zinc-500 mb-4">Choose a primary color for buttons and highlights.</p>
                    <div className="flex flex-wrap gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setAccentColor(color.value as any)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${color.class} ${accentColor === color.value ? 'ring-2 ring-offset-2 ring-zinc-900' : ''}`}
                                title={color.name}
                            >
                                {accentColor === color.value && <CheckCircle2 size={16} className="text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Dashboard Widgets */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                            <Layout size={18} /> Dashboard Widgets
                        </h3>
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">Drag to reorder (Coming Soon)</span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-4">Select which cards appear on your main overview.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { id: 'financial', label: 'Financial Summary' },
                            { id: 'activity', label: 'Recent Activity' },
                            { id: 'occupancy', label: 'Occupancy Stats' },
                            { id: 'tasks', label: 'Upcoming Tasks' },
                            { id: 'maintenance', label: 'Maintenance Requests' },
                            { id: 'analytics', label: 'Portfolio Analytics' },
                        ].map((widget) => (
                            <label key={widget.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${widgets[widget.id as keyof typeof widgets] ? 'bg-zinc-50 border-zinc-300' : 'border-zinc-100 hover:bg-zinc-50'}`}>
                                <input
                                    type="checkbox"
                                    checked={widgets[widget.id as keyof typeof widgets]}
                                    onChange={() => toggleWidget(widget.id as keyof typeof widgets)}
                                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                                />
                                <span className="font-medium text-zinc-700 text-sm">{widget.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 3. Layout Preference */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden p-6 lg:col-span-2">
                    <h3 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Grid size={18} /> Dashboard Layout Density
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setLayoutDensity('compact')}
                            className={`p-4 border rounded-xl text-left transition ${layoutDensity === 'compact' ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
                        >
                            <div className="flex gap-1 mb-2">
                                <div className="w-full h-12 bg-zinc-200 rounded"></div>
                                <div className="w-full h-12 bg-zinc-200 rounded"></div>
                                <div className="w-full h-12 bg-zinc-200 rounded"></div>
                            </div>
                            <span className="font-bold text-sm block text-zinc-900">Compact</span>
                            <span className="text-xs text-zinc-500">More data, less scrolling.</span>
                        </button>

                        <button
                            onClick={() => setLayoutDensity('comfortable')}
                            className={`p-4 border rounded-xl text-left transition ${layoutDensity === 'comfortable' ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
                        >
                            <div className="flex gap-1 mb-2">
                                <div className="w-full h-12 bg-zinc-200 rounded"></div>
                                <div className="w-full h-12 bg-zinc-200 rounded"></div>
                            </div>
                            <span className="font-bold text-sm block text-zinc-900">Standard</span>
                            <span className="text-xs text-zinc-500">Balanced spacing and size.</span>
                        </button>

                        <button
                            onClick={() => setLayoutDensity('spacious')}
                            className={`p-4 border rounded-xl text-left transition ${layoutDensity === 'spacious' ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
                        >
                            <div className="mb-2">
                                <div className="w-full h-12 bg-zinc-200 rounded"></div>
                            </div>
                            <span className="font-bold text-sm block text-zinc-900">Spacious</span>
                            <span className="text-xs text-zinc-500">Focus on one item at a time.</span>
                        </button>
                    </div>
                </div>

            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Customizations
                </button>
            </div>
        </div>
    );
}
