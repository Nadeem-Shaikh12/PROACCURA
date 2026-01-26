import mongoose, { Schema, Model } from 'mongoose';
import { Message } from '@/lib/types';

const MessageSchema = new Schema<Message>({
    id: { type: String, required: true, unique: true },
    senderId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    content: { type: String, required: true },
    timestamp: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    type: { type: String, enum: ['text', 'template', 'system', 'audio', 'file'], required: true, default: 'text' },
    audioUrl: { type: String },
    duration: { type: Number },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
});

const MessageModel: Model<Message> = mongoose.models.Message || mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;
