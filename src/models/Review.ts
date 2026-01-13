import mongoose, { Schema, Model } from 'mongoose';
import { Review } from '@/lib/types';

const ReviewSchema = new Schema<Review>({
    id: { type: String, required: true, unique: true },
    reviewerId: { type: String, required: true, ref: 'User' },
    revieweeId: { type: String, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    stayId: { type: String, required: true },
    createdAt: { type: String, required: true },
});

const ReviewModel: Model<Review> = mongoose.models.Review || mongoose.model<Review>('Review', ReviewSchema);

export default ReviewModel;
