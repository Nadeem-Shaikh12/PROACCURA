export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'landlord' | 'tenant';
    mobile?: string;
    profilePhoto?: string;
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
        mobile: string;
        city: string;
        state: string;
        aadhaarNumber: string;
        isProfileComplete: boolean;
        paymentStatus: 'PENDING' | 'PAID';
    };
}

export interface Property {
    id: string;
    landlordId: string;
    name: string;
    address: string;
    units: number;
    occupiedUnits: number;
    vacantUnits?: number;
    monthlyRent: number;
    type: 'Apartment' | 'House' | 'Shop' | 'Other';
    createdAt: string;
}

export interface VerificationRequest {
    id: string;
    tenantId: string;
    fullName: string;
    mobile: string;
    idProofType: 'Aadhaar' | 'Passport' | 'Other';
    idProofNumber: string;
    city: string;
    landlordId: string;
    propertyId?: string;
    status: 'pending' | 'approved' | 'rejected' | 'moved_out';
    paymentStatus?: 'pending' | 'paid';
    paymentAmount?: number;
    transactionId?: string;
    remarks?: string;
    submittedAt: string;
    updatedAt?: string;
    verifiedAt?: string;
    joiningDate?: string;
    rentNotes?: string;
    utilityDetails?: string;
}

export interface TenantHistory {
    id: string;
    tenantId: string;
    type: 'JOINED' | 'LIGHT_BILL' | 'REMARK' | 'RENT_PAYMENT' | 'MOVE_OUT' | 'PAYMENT';
    description: string;
    amount?: number;
    month?: string;
    year?: string;
    units?: number;
    status?: 'paid' | 'pending';
    date: string;
    createdBy: string;
}

export interface Notification {
    id: string;
    userId: string;
    role: 'landlord' | 'tenant';
    title: string;
    message: string;
    type: 'MONTH_COMPLETED' | 'NEW_BILL_CYCLE' | 'PAYMENT_PENDING' | 'PAYMENT_RECEIVED' | 'REMARK_ADDED';
    isRead: boolean;
    createdAt: string;
}

export interface Bill {
    id: string;
    stayId: string;
    tenantId: string;
    landlordId: string;
    amount: number;
    type: 'RENT' | 'ELECTRICITY' | 'WATER' | 'MAINTENANCE' | 'OTHER';
    month: string;
    units?: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paidAt?: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    type: 'text' | 'template' | 'system';
}

export interface Review {
    id: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    stayId: string;
    createdAt: string;
}

export interface TenantStay {
    id: string;
    tenantId: string;
    landlordId: string;
    propertyId: string;
    joinDate: string;
    moveOutDate?: string;
    status: 'ACTIVE' | 'MOVED_OUT';
}
