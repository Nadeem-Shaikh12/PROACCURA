import mongoose, { Schema, Model } from 'mongoose';
import { Announcement } from '@/lib/types';

const AnnouncementSchema = new Schema<Announcement>({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true, enum: ['EVENT', 'NOTICE', 'NEWS', 'ALERT'] },
    authorId: { type: String, required: true, ref: 'User' },
    authorName: { type: String, required: true },
});

const AnnouncementModel: Model<Announcement> = mongoose.models.Announcement || mongoose.model<Announcement>('Announcement', AnnouncementSchema);

export default AnnouncementModel;
