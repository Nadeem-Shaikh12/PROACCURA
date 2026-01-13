import mongoose, { Schema, Model } from 'mongoose';
import { Bill } from '@/lib/types';

const BillSchema = new Schema<Bill>({
    id: { type: String, required: true, unique: true },
    stayId: { type: String, required: true },
    tenantId: { type: String, required: true, ref: 'User' },
    landlordId: { type: String, required: true, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['RENT', 'ELECTRICITY', 'WATER', 'MAINTENANCE', 'OTHER'], required: true },
    month: { type: String, required: true },
    units: { type: Number },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], required: true },
    paidAt: { type: String },
});

const BillModel: Model<Bill> = mongoose.models.Bill || mongoose.model<Bill>('Bill', BillSchema);

export default BillModel;
