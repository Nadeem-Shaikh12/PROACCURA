import mongoose, { Schema, Model } from 'mongoose';
import { VerificationRequest } from '@/lib/types';

const VerificationRequestSchema = new Schema<VerificationRequest>({
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, ref: 'User' },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    idProofType: { type: String, enum: ['Aadhaar', 'Passport', 'Other'], required: true },
    idProofNumber: { type: String, required: true },
    city: { type: String, required: true },
    landlordId: { type: String, required: true, ref: 'User' },
    propertyId: { type: String, ref: 'Property' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'moved_out'], required: true, default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid'] },
    paymentAmount: { type: Number },
    transactionId: { type: String },
    remarks: { type: String },
    submittedAt: { type: String, required: true },
    updatedAt: { type: String },
    verifiedAt: { type: String },
    joiningDate: { type: String },
    rentNotes: { type: String },
    utilityDetails: { type: String },
});

const VerificationRequestModel: Model<VerificationRequest> = mongoose.models.VerificationRequest || mongoose.model<VerificationRequest>('VerificationRequest', VerificationRequestSchema);

export default VerificationRequestModel;
