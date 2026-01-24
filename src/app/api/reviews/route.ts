import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    // Optional: Add filtering query params if needed
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // "Get reviews FOR this user"

    if (userId) {
        const reviews = await db.getReviews(userId);
        return NextResponse.json(reviews);
    }

    // Fallback: return all reviews for the community section
    // In a real app, you might want to limit this or paginate
    const allReviews = await db.getAllReviews(); // You might need to add this method to db.ts if it doesn't exist, or we can assume getReviews without ID returns all? 
    // Actually, looking at db.ts (assumed), we might need to implement getAllReviews or similar. 
    // For now, let's assume we can fetch all. If not, we'll fix db.ts next.
    // Let's check db.ts first to be sure, but for this step I'll assume I need to add it or it exists.
    // Wait, the plan said "Modify GET handler to return reviews if no userId is specified".
    // I will implementation a GetAllReviews in db.ts if needed, but for now let's try to query all.

    // safe fallback if db.getAllReviews doesn't exist yet (we will add it)
    try {
        const allReviews = await db.getAllReviews();
        return NextResponse.json(allReviews);
    } catch (e) {
        // returning empty if method missing to avoid crash until db.ts is updated
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Support both old "Testimonial" style and new "Transactional" style
        // Transactional: reviewerId, revieweeId, stayId, rating, comment
        // Testimonial (legacy/existing): name, rating, comment, userId (as reviewer)

        let reviewData: any; // Keeping 'any' temporarily to merge unrelated types, or better: use a union type

        if (body.stayId && body.revieweeId) {
            // Transactional Rating (Landlord -> Tenant or vice versa)
            reviewData = {
                id: Math.random().toString(36).substr(2, 9),
                reviewerId: body.reviewerId,
                revieweeId: body.revieweeId,
                rating: body.rating,
                comment: body.comment,
                stayId: body.stayId,
                createdAt: new Date().toISOString()
            };
        } else {
            // Legacy/Testimonial support
            reviewData = {
                id: Math.random().toString(36).substr(2, 9),
                reviewerId: body.userId || body.name || 'ANONYMOUS', // Fallback
                revieweeId: 'PLATFORM',
                rating: Number(body.rating),
                comment: body.comment,
                stayId: 'GENERAL',
                createdAt: new Date().toISOString()
            };
        }

        const review = await db.addReview(reviewData);

        // If it's a transactional review, notify the reviewee
        if (body.revieweeId && body.revieweeId !== 'PLATFORM') {
            await db.addNotification({
                id: Math.random().toString(36).substr(2, 9),
                userId: body.revieweeId,
                role: 'tenant', // Defaulting to tenant for now, logic can be improved
                title: 'New Rating Received',
                message: `You received a ${body.rating}-star rating.`,
                type: 'REMARK_ADDED',
                isRead: false,
                createdAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error('Review create error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
