'use client';

import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { SidebarProvider } from '@/context/SidebarContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DataProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </DataProvider>
        </AuthProvider>
    );
}
