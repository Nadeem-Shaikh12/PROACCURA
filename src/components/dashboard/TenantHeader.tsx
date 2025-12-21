'use client';

import { User, LogOut, Home, Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useSidebar } from '@/context/SidebarContext';

interface Props {
    isApproved?: boolean;
}

export default function TenantHeader({ isApproved }: Props) {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className={`h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 left-0 ${isApproved ? 'md:left-64' : ''} z-30 transition-all duration-300`}>

            {/* Mobile / Unapproved Brand */}
            <div className={`flex items-center gap-3 ${isApproved ? '' : ''}`}>
                <button
                    onClick={toggleSidebar}
                    className={`p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg ${isApproved ? 'md:hidden' : 'hidden'}`}
                >
                    <Menu size={20} />
                </button>
                <div className={`flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 ${isApproved ? 'md:hidden' : ''}`}>
                    <Home size={22} className="text-zinc-900 dark:text-white" />
                    <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">PropAccura</span>
                </div>
            </div>

            {/* Search - Shown when approved and on larger screens */}
            {isApproved && (
                <div className={`hidden sm:flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full transition-all duration-300 ${isSearchFocused ? 'lg:w-[400px] w-72 ring-2 ring-indigo-500/20' : 'w-64'}`}>
                    <Search size={18} className="text-zinc-400" />
                    <input
                        placeholder="Search records, bills..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="bg-transparent border-none outline-none text-sm w-full"
                    />
                </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-4 ml-auto">
                <NotificationDropdown />

                <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 sm:mx-2 hidden xs:block"></div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex text-right flex-col items-end">
                        <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                            {user?.name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 font-medium uppercase tracking-tighter">Tenant</div>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700">
                        <User size={18} className="sm:size-5" />
                    </div>

                    <button
                        onClick={logout}
                        className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Logout"
                    >
                        <LogOut size={18} className="sm:size-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
