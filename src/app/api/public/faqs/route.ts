import { NextResponse } from 'next/server';
import query from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        let sql = 'SELECT * FROM faqs WHERE is_active = 1 ORDER BY priority DESC, created_at DESC';
        const params: any[] = [];

        if (limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const [faqs] = await query.query(sql, params);
        return NextResponse.json(faqs);
    } catch (error) {
        console.error('Error fetching public FAQs:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }
}
