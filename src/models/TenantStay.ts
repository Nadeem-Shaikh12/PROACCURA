import mongoose, { Schema, Model } from 'mongoose';
import { TenantStay } from '@/lib/types';

const TenantStaySchema = new Schema<TenantStay>({
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, ref: 'User' },
    landlordId: { type: String, required: true, ref: 'User' },
    propertyId: { type: String, required: true, ref: 'Property' },
    joinDate: { type: String, required: true },
    moveOutDate: { type: String },
    status: { type: String, enum: ['ACTIVE', 'MOVED_OUT'], required: true },
});

const TenantStayModel: Model<TenantStay> = mongoose.models.TenantStay || mongoose.model<TenantStay>('TenantStay', TenantStaySchema);

export default TenantStayModel;
