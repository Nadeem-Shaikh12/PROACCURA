'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { FileText, Archive, Shield, Save, Loader2, Trash2 } from 'lucide-react';

export default function DocumentSettingsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        allowedFileTypes: {
            pdf: true,
            jpg: true,
            png: true,
            doc: false
        },
        maxFileSizeMB: 10,
        autoArchiveAfterDays: 365,
        defaultFolders: ['Leases', 'Notices', 'Invoices', 'Legal']
    });

    const [newFolder, setNewFolder] = useState('');

    useEffect(() => {
        if (user?.documentSettings) {
            setSettings({
                allowedFileTypes: user.documentSettings.allowedFileTypes || {
                    pdf: true,
                    jpg: true,
                    png: true,
                    doc: false
                },
                maxFileSizeMB: user.documentSettings.maxFileSizeMB || 10,
                autoArchiveAfterDays: user.documentSettings.autoArchiveAfterDays || 365,
                defaultFolders: user.documentSettings.defaultFolders || ['Leases', 'Notices', 'Invoices', 'Legal']
            });
        }
    }, [user]);

    const toggleType = (key: keyof typeof settings.allowedFileTypes) => {
        setSettings(prev => ({
            ...prev,
            allowedFileTypes: { ...prev.allowedFileTypes, [key]: !prev.allowedFileTypes[key] }
        }));
    };

    const addFolder = () => {
        if (newFolder.trim()) {
            setSettings(prev => ({ ...prev, defaultFolders: [...prev.defaultFolders, newFolder] }));
            setNewFolder('');
        }
    };

    const removeFolder = (index: number) => {
        setSettings(prev => ({
            ...prev,
            defaultFolders: prev.defaultFolders.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentSettings: settings })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                alert('Document settings saved!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save document settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Documents & Files</h1>
                <p className="text-zinc-500">Manage file upload rules and storage preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Upload Restrictions */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Upload Restrictions</h3>
                            <p className="text-xs text-zinc-500">Security and size limits for files</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-2">Allowed File Types</label>
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(settings.allowedFileTypes).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleType(type as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border transition ${settings.allowedFileTypes[type as keyof typeof settings.allowedFileTypes]
                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-2">Max Upload Size</label>
                            <input
                                type="range"
                                min="2" max="50"
                                value={settings.maxFileSizeMB}
                                onChange={(e) => setSettings({ ...settings, maxFileSizeMB: parseInt(e.target.value) })}
                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                            />
                            <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                <span>2 MB</span>
                                <span className="font-bold text-zinc-900">{settings.maxFileSizeMB} MB</span>
                                <span>50 MB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Organization & Retention */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600">
                            <Archive size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900">Organization & Retention</h3>
                            <p className="text-xs text-zinc-500">Folder structure and auto-archival</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-2">Default Folders</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    value={newFolder}
                                    onChange={(e) => setNewFolder(e.target.value)}
                                    placeholder="Add category..."
                                    className="flex-1 p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                <button
                                    type="button"
                                    onClick={addFolder}
                                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-sm font-medium"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="space-y-1">
                                {settings.defaultFolders.map((folder, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg text-sm group">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-zinc-400" />
                                            <span>{folder}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFolder(idx)}
                                            className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-50">
                            <label className="text-sm font-medium text-zinc-700 block mb-1">Auto-Archive Old Documents</label>
                            <select
                                value={settings.autoArchiveAfterDays}
                                onChange={(e) => setSettings({ ...settings, autoArchiveAfterDays: parseInt(e.target.value) })}
                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            >
                                <option value="90">After 3 Months</option>
                                <option value="180">After 6 Months</option>
                                <option value="365">After 1 Year</option>
                                <option value="0">Never Archive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white font-medium rounded-xl hover:bg-black transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Preferences
                    </button>
                </div>
            </form>
        </div>
    );
}
