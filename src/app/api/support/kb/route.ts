import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const articles = await db.getSupportArticles();
        return NextResponse.json(articles);
    } catch (error) {
        console.error('Error fetching support articles:', error);
        return NextResponse.json({ error: 'Failed to fetch documentation' }, { status: 500 });
    }
}
