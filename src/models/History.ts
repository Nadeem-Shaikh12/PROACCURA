import mongoose, { Schema, Model } from 'mongoose';
import { TenantHistory } from '@/lib/types';

const HistorySchema = new Schema<TenantHistory>({
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, ref: 'User' },
    type: { type: String, enum: ['JOINED', 'LIGHT_BILL', 'REMARK', 'RENT_PAYMENT', 'MOVE_OUT', 'PAYMENT'], required: true },
    description: { type: String, required: true },
    amount: { type: Number },
    month: { type: String },
    year: { type: String },
    units: { type: Number },
    status: { type: String, enum: ['paid', 'pending'] },
    date: { type: String, required: true },
    createdBy: { type: String, required: true, ref: 'User' },
});

const HistoryModel: Model<TenantHistory> = mongoose.models.History || mongoose.model<TenantHistory>('History', HistorySchema);

export default HistoryModel;
