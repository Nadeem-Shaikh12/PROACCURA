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

    // Fallback: return empty or all reviews (be careful with all)
    return NextResponse.json([]);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Support both old "Testimonial" style and new "Transactional" style
        // Transactional: reviewerId, revieweeId, stayId, rating, comment
        // Testimonial (legacy/existing): name, rating, comment, userId (as reviewer)

        let reviewData: any;

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
            // Map 'userId' to 'reviewerId' and maybe 'revieweeId' to 'PLATFORM' or null?
            // For now, let's just save it.
            reviewData = {
                id: Math.random().toString(36).substr(2, 9),
                reviewerId: body.userId,
                revieweeId: 'PLATFORM', // Placeholder
                rating: Number(body.rating),
                comment: body.comment,
                stayId: 'GENERAL',
                createdAt: new Date().toISOString()
            };
        }

        const review = await db.addReview(reviewData);

        // If it's a transactional review, notify the reviewee
        if (body.revieweeId) {
            await db.addNotification({
                id: Math.random().toString(36).substr(2, 9),
                userId: body.revieweeId,
                role: 'tenant', // This technically depends on who the reviewee is. 
                // Ideally pass 'revieweeRole' or look up user.
                // For MVP "End Stay", reviewee is Tenant.
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
