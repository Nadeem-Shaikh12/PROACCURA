export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'landlord' | 'tenant' | 'admin';
    status?: 'active' | 'inactive' | 'removed';
    mobile?: string;
    company?: string;
    address?: string;
    profilePhoto?: string;
    language?: string;
    timezone?: string;
    dateFormat?: string;
    notificationPreferences?: {
        email: {
            maintenance: boolean;
            payments: boolean;
            documents: boolean;
            marketing: boolean;
        };
        push: {
            messages: boolean;
            requests: boolean;
            reminders: boolean;
        };
    };
    portalPreferences?: {
        theme: 'light' | 'dark' | 'system';
        landingPage: 'dashboard' | 'payments' | 'messages';
        emailFormat: 'html' | 'text';
        accentColor?: 'blue' | 'violet' | 'emerald' | 'rose' | 'amber' | 'slate';
        layoutDensity?: 'compact' | 'comfortable' | 'spacious';
        dashboardWidgets?: Record<string, boolean>;
    };
    securitySettings?: {
        twoFactorEnabled: boolean;
        twoFactorSecret?: string;
        lastLogin?: string;
        loginHistory?: { date: string; device: string; ip: string }[];
    };
    propertyDefaults?: {
        rentDueDay: number;
        gracePeriodDays: number;
        lateFeePercentage: number;
        defaultLeaseMonths: number;
        requireSecurityDeposit: boolean;
    };
    tenantPortalSettings?: {
        allowDocumentUploads: boolean;
        showPaymentHistory: boolean;
        showMaintenanceRequests: boolean;
        requireRentersInsurance: boolean;
        autoInvite: boolean;
    };
    documentSettings?: {
        allowedFileTypes: { pdf: boolean; jpg: boolean; png: boolean; doc: boolean };
        maxFileSizeMB: number;
        autoArchiveAfterDays: number;
        defaultFolders: string[];
    };
    financialSettings?: {
        currency: string;
        taxRate: number;
        bankDetails?: {
            accountName: string;
            accountNumber: string;
            bankName: string;
            ifsc: string;
        };
    };
    integrationSettings?: {
        paymentGateway?: { provider: 'stripe' | 'razorpay' | 'paypal', apiKey: string, secretKey: string, enabled: boolean };
        accounting?: { provider: 'quickbooks' | 'xero', connected: boolean, lastSync?: string };
        communication?: {
            twilio?: { sid: string, token: string, fromNumber: string, enabled: boolean };
            sendgrid?: { apiKey: string, fromEmail: string, enabled: boolean };
        };
        crm?: { provider: 'salesforce' | 'hubspot', connected: boolean };
        developerApi?: {
            keys: { name: string, key: string, role: 'admin' | 'read-only', createdAt: string }[];
            webhooks: { id: string, url: string, events: string[], enabled: boolean }[];
        };
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
    type: 'MONTH_COMPLETED' | 'NEW_BILL_CYCLE' | 'PAYMENT_PENDING' | 'PAYMENT_RECEIVED' | 'REMARK_ADDED' | 'MAINTENANCE_UPDATE';
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
    type: 'text' | 'template' | 'system' | 'audio' | 'file';
    audioUrl?: string;
    duration?: number;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
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

export interface MaintenanceComment {
    id: string;
    userId: string;
    userName: string;
    role: 'landlord' | 'tenant';
    content: string;
    createdAt: string;
}

export interface MaintenanceRequest {
    id: string;
    landlordId: string;
    tenantId: string;
    tenantName: string;
    propertyName: string;
    title: string;
    description: string;
    category: 'PLUMBING' | 'ELECTRICAL' | 'APPLIANCE' | 'STRUCTURAL' | 'OTHER';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
    status: 'OPEN' | 'IN_PROGRESS' | 'SCHEDULED' | 'RESOLVED' | 'CANCELLED';
    images: string[];
    comments: MaintenanceComment[];
    scheduledDate?: string;
    rating?: number;
    feedback?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    type: 'EVENT' | 'NOTICE' | 'NEWS' | 'ALERT';
    authorId: string;
    authorName: string;
}

export interface SupportArticle {
    id: string;
    title: string;
    content: string;
    category: 'ACCOUNT' | 'PAYMENTS' | 'PROPERTIES' | 'TENANTS' | 'TECHNICAL';
    tags: string[];
    helpfulCount: number;
    updatedAt: string;
}

export interface SupportTicketReply {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: 'landlord' | 'support';
    content: string;
    attachments?: string[];
    createdAt: string;
}

export interface SupportTicket {
    id: string;
    landlordId: string;
    subject: string;
    category: 'BILLING' | 'TECHNICAL' | 'ACCOUNT' | 'FEATURE_REQUEST' | 'OTHER';
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_REPLY' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'NORMAL' | 'HIGH';
    attachments: string[];
    replies: SupportTicketReply[];
    createdAt: string;
    updatedAt: string;
}
