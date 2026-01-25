import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/lib/types';

const UserSchema = new Schema<User>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['landlord', 'tenant'], required: true },
    mobile: { type: String },
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
