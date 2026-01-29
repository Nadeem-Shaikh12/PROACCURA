import mongoose, { Schema, Model } from 'mongoose';
import { MaintenanceRequest, MaintenanceComment } from '@/lib/types';

const CommentSchema = new Schema<MaintenanceComment>({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    role: { type: String, required: true, enum: ['landlord', 'tenant'] },
    content: { type: String, required: true },
    createdAt: { type: String, required: true },
});

const MaintenanceRequestSchema = new Schema<MaintenanceRequest>({
    id: { type: String, required: true, unique: true },
    landlordId: { type: String, required: true, ref: 'User' },
    tenantId: { type: String, required: true, ref: 'User' },
    tenantName: { type: String, required: true },
    propertyName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['PLUMBING', 'ELECTRICAL', 'APPLIANCE', 'STRUCTURAL', 'OTHER'] },
    priority: { type: String, required: true, enum: ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'] },
    status: { type: String, required: true, enum: ['OPEN', 'IN_PROGRESS', 'SCHEDULED', 'RESOLVED', 'CANCELLED'] },
    images: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
    scheduledDate: { type: String },
    rating: { type: Number },
    feedback: { type: String },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
});

const MaintenanceRequestModel: Model<MaintenanceRequest> = mongoose.models.MaintenanceRequest || mongoose.model<MaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);

export default MaintenanceRequestModel;
