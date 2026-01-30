import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/lib/types';

const UserSchema = new Schema<User>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['landlord', 'tenant'], required: true },
    status: { type: String, enum: ['active', 'inactive', 'removed'], default: 'active' },
    mobile: { type: String },
    company: { type: String },
    address: { type: String },
    profilePhoto: { type: String },
    language: { type: String },
    timezone: { type: String },
    notificationPreferences: {
        rentReminders: { type: Boolean, default: true },
        maintenanceUpdates: { type: Boolean, default: true },
        leaseRenewal: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        documents: { type: Boolean, default: true },
    },
    portalPreferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
        landingPage: { type: String, enum: ['dashboard', 'payments', 'messages'], default: 'dashboard' },
        emailFormat: { type: String, enum: ['html', 'text'], default: 'html' },
    },
    securitySettings: {
        twoFactorEnabled: { type: Boolean, default: false },
        lastLogin: { type: String },
        loginHistory: [{ date: String, device: String, ip: String }]
    },
    propertyDefaults: {
        rentDueDay: { type: Number, default: 1 },
        gracePeriodDays: { type: Number, default: 5 },
        lateFeePercentage: { type: Number, default: 5 },
        defaultLeaseMonths: { type: Number, default: 12 },
        requireSecurityDeposit: { type: Boolean, default: true },
    },
    tenantPortalSettings: {
        allowDocumentUploads: { type: Boolean, default: true },
        showPaymentHistory: { type: Boolean, default: true },
        showMaintenanceRequests: { type: Boolean, default: true },
        requireRentersInsurance: { type: Boolean, default: false },
        autoInvite: { type: Boolean, default: false },
    },
    documentSettings: {
        allowedFileTypes: { type: [String], default: ['pdf', 'jpg', 'png'] },
        maxFileSizeMB: { type: Number, default: 10 },
        autoArchiveAfterDays: { type: Number },
    },
    financialSettings: {
        currency: { type: String, default: 'INR' },
        taxRate: { type: Number, default: 0 },
        bankDetails: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            ifsc: String,
        },
    },
    integrationSettings: {
        paymentGateway: {
            provider: { type: String, enum: ['stripe', 'razorpay', 'paypal'] },
            apiKey: String,
            secretKey: String,
            enabled: { type: Boolean, default: false },
        },
        accounting: {
            provider: { type: String, enum: ['quickbooks', 'xero'] },
            connected: { type: Boolean, default: false },
        },
    },
    tenantProfile: {
        mobile: { type: String },
        city: { type: String },
        state: { type: String },
        aadhaarNumber: { type: String },
        isProfileComplete: { type: Boolean, default: false },
        paymentStatus: { type: String, enum: ['PENDING', 'PAID'] },
    },
}, { timestamps: true });

// Prevent overwrite during hot reload
const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
