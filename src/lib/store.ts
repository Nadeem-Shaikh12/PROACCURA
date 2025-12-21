
export type Role = 'landlord' | 'tenant';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
}

export interface StoredDocument {
    id: string;
    tenantId: string;
    landlordId: string;
    category: 'LEASE' | 'ID_PROOF' | 'BILL' | 'REPORT' | 'OTHER';
    name: string;
    url: string;
    version: number;
    createdAt: string;
    description?: string;
}

export interface Property {
    id: string;
    landlordId: string;
    title: string;
    description: string;
    price: number;
    location: string;
    imageUrl: string;
    verified: boolean;
}

export interface Application {
    id: string;
    propertyId: string;
    tenantId: string;
    tenantName: string; // denormalized for ease
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    documents: string[]; // Mock URLs
}

// Mock Data
export const MOCK_LANDLORD: User = {
    id: 'landlord-1',
    name: 'John Landlord',
    email: 'john@rental.com',
    role: 'landlord',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
};

export const MOCK_TENANT: User = {
    id: 'tenant-1',
    name: 'Jane Tenant',
    email: 'jane@rental.com',
    role: 'tenant',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
};

export const MOCK_PROPERTIES: Property[] = [
    {
        id: 'prop-1',
        landlordId: 'landlord-1',
        title: 'Sunny Downtown Apartment',
        description: 'A beautiful 2-bedroom apartment in the heart of the city. Close to all amenities.',
        price: 2500,
        location: '123 Main St, Metropolis',
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        verified: true,
    },
    {
        id: 'prop-2',
        landlordId: 'landlord-1',
        title: 'Cozy Suburban Home',
        description: 'Perfect for a small family. Large backyard and garage.',
        price: 1800,
        location: '456 Willow Ln, Suburbia',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        verified: true,
    },
];

export const MOCK_APPLICATIONS: Application[] = [
    {
        id: 'app-1',
        propertyId: 'prop-1',
        tenantId: 'tenant-1',
        tenantName: 'Jane Tenant',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents: ['doc-1.pdf', 'doc-2.jpg'],
    }
];

export interface Lease {
    id: string;
    propertyName: string;
    tenantName: string;
    tenantId: string;
    landlordId: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'PENDING_SIGNATURE' | 'EXPIRED' | 'TERMINATED';
    documentUrl: string;
    signedByLandlord: boolean;
    signedByTenant: boolean;
}

export const MOCK_LEASES: Lease[] = [
    {
        id: 'lease-1',
        propertyName: 'Sunny Downtown Apartment',
        tenantName: 'Jane Tenant',
        tenantId: 'tenant-1',
        landlordId: 'landlord-1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'ACTIVE',
        documentUrl: '#',
        signedByLandlord: true,
        signedByTenant: true
    },
    {
        id: 'lease-2',
        propertyName: 'Cozy Suburban Home',
        tenantName: 'John Doe',
        tenantId: 'tenant-2',
        landlordId: 'landlord-1',
        startDate: '2024-02-01',
        endDate: '2025-02-01',
        status: 'PENDING_SIGNATURE',
        documentUrl: '#',
        signedByLandlord: true,
        signedByTenant: false
    }
];

// Payment & Scheduler Types
export interface PaymentSchedule {
    id: string;
    landlordId: string;
    tenantId: string;
    stayId: string; // link to property stay
    amount: number;
    frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
    nextDueDate: string;
    isActive: boolean;
}

export interface PaymentRecord {
    id: string;
    billId: string;
    amount: number;
    paidAt: string;
    method: 'ONLINE' | 'CASH' | 'BANK_TRANSFER';
    transactionId?: string;
}

export const MOCK_SCHEDULES: PaymentSchedule[] = [
    {
        id: 'sched-1',
        landlordId: 'landlord-1',
        tenantId: 'tenant-1',
        stayId: 'stay-1',
        amount: 2500,
        frequency: 'MONTHLY',
        nextDueDate: '2025-01-01',
        isActive: true
    }
];

export const MOCK_PAYMENTS: PaymentRecord[] = [];

// Maintenance Types
export interface MaintenanceRequest {
    id: string;
    landlordId: string;
    tenantId: string;
    tenantName: string;
    propertyName: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
    {
        id: 'maint-1',
        landlordId: 'landlord-1',
        tenantId: 'tenant-1',
        tenantName: 'Jane Tenant',
        propertyName: 'Sunny Downtown Apartment',
        title: 'Leaking Faucet',
        description: 'The kitchen faucet is dripping constantly.',
        priority: 'LOW',
        status: 'OPEN',
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Simple in-memory store for the session (refreshes on reload, effectively)
// For a "working" app that persists a bit better without backend, we could use localStorage in components.
// I will just export these raw lists to be used by components initially.
