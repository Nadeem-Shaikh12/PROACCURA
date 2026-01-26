import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    id: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ['landlord', 'support'], required: true },
    content: { type: String, required: true },
    attachments: [String],
    createdAt: { type: String, required: true }
});

const SupportTicketSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    landlordId: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'AWAITING_REPLY', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' },
    attachments: [String],
    replies: [ReplySchema],
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
