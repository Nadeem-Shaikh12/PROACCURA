import mongoose, { Schema, Model } from 'mongoose';
import { Property } from '@/lib/types';

const PropertySchema = new Schema<Property>({
    id: { type: String, required: true, unique: true },
    landlordId: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true },
    address: { type: String, required: true },
    units: { type: Number, required: true },
    occupiedUnits: { type: Number, required: true, default: 0 },
    vacantUnits: { type: Number },
    monthlyRent: { type: Number, required: true },
    type: { type: String, enum: ['Apartment', 'House', 'Shop', 'Other'], required: true },
    createdAt: { type: String, required: true },
});

const PropertyModel: Model<Property> = mongoose.models.Property || mongoose.model<Property>('Property', PropertySchema);

export default PropertyModel;
