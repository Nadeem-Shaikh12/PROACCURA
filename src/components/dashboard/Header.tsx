import { Search, LogOut, User, Menu, Home, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown';
import { useSidebar } from '@/context/SidebarContext';

export default function Header() {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    // Sync local state if URL change externally (e.g. back button)
    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
            params.set('q', val);
        } else {
            params.delete('q');
        }

        // Push only if we are on a relevant page or just push to update URL
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 left-0 md:left-64 z-30 transition-all">

            {/* Mobile Menu & Brand */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg md:hidden"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 md:hidden">
                    <Home size={20} />
                    <span className="text-lg tracking-tight text-zinc-900 dark:text-white font-black">PropAccura</span>
                </div>
            </div>

            {/* Search - Hidden on Small Mobile when not focused */}
            <div className={`hidden sm:flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full transition-all duration-300 ${isSearchFocused ? 'lg:w-[400px] w-72 ring-2 ring-indigo-500/20' : 'w-64'}`}>
                <Search size={18} className="text-zinc-400" />
                <input
                    placeholder="Search properties, tenants..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="bg-transparent border-none outline-none text-sm w-full"
                />
                {searchQuery && (
                    <button onClick={() => handleSearch('')} className="text-zinc-400 hover:text-zinc-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-4 ml-auto">
                <NotificationDropdown />

                <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 sm:mx-2 hidden xs:block"></div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex text-right flex-col items-end">
                        <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                            {user?.name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-500">Landlord</div>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-full border border-indigo-200 dark:border-indigo-800">
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
