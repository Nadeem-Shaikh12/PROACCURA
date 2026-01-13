import mongoose, { Schema, Model } from 'mongoose';
import { StoredDocument } from '@/lib/store';

const DocumentSchema = new Schema<StoredDocument>({
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, ref: 'User' },
    landlordId: { type: String, required: true, ref: 'User' },
    category: { type: String, enum: ['LEASE', 'ID_PROOF', 'BILL', 'REPORT', 'OTHER'], required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    version: { type: Number, default: 1 },
    createdAt: { type: String, required: true },
    description: { type: String },
});

const DocumentModel: Model<StoredDocument> = mongoose.models.Document || mongoose.model<StoredDocument>('Document', DocumentSchema);

export default DocumentModel;
