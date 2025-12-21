'use client';

import React, { createContext, useContext, useState } from 'react';
import { Property, Application, MOCK_PROPERTIES, MOCK_APPLICATIONS } from '@/lib/store';

interface DataContextType {
    properties: Property[];
    applications: Application[];
    applyForProperty: (propertyId: string, tenantId: string, tenantName: string) => void;
    updateApplicationStatus: (appId: string, status: 'approved' | 'rejected') => void;
    addProperty: (property: Property) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

    const applyForProperty = (propertyId: string, tenantId: string, tenantName: string) => {
        const newApp: Application = {
            id: `app-${Date.now()}`,
            propertyId,
            tenantId,
            tenantName,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            documents: []
        };
        setApplications(prev => [...prev, newApp]);
    };

    const updateApplicationStatus = (appId: string, status: 'approved' | 'rejected') => {
        setApplications(prev => prev.map(app =>
            app.id === appId ? { ...app, status } : app
        ));
    };

    const addProperty = (property: Property) => {
        setProperties(prev => [...prev, property]);
    };

    return (
        <DataContext.Provider value={{ properties, applications, applyForProperty, updateApplicationStatus, addProperty }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
