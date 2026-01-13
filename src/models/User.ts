import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/lib/types';

const UserSchema = new Schema<User>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['landlord', 'tenant'], required: true },
    mobile: { type: String },
    aadhaar: { type: String },
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
