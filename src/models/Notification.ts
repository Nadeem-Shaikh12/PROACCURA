import mongoose, { Schema, Model } from 'mongoose';
import { Notification } from '@/lib/types';

const NotificationSchema = new Schema<Notification>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: 'User' },
    role: { type: String, enum: ['landlord', 'tenant'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['MONTH_COMPLETED', 'NEW_BILL_CYCLE', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'REMARK_ADDED'], required: true },
    isRead: { type: Boolean, required: true, default: false },
    createdAt: { type: String, required: true },
});

const NotificationModel: Model<Notification> = mongoose.models.Notification || mongoose.model<Notification>('Notification', NotificationSchema);

export default NotificationModel;
