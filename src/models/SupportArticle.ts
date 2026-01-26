import mongoose from 'mongoose';

const SupportArticleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    helpfulCount: { type: Number, default: 0 },
    updatedAt: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.SupportArticle || mongoose.model('SupportArticle', SupportArticleSchema);
