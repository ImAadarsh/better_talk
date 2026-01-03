import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [faqs] = await pool.query('SELECT * FROM faqs ORDER BY priority DESC, created_at DESC');
        return NextResponse.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { question, answer, priority } = await req.json();

        if (!question || !answer) {
            return NextResponse.json({ error: 'Question and Answer are required' }, { status: 400 });
        }

        const [result]: any = await pool.query(
            'INSERT INTO faqs (question, answer, priority, is_active) VALUES (?, ?, ?, ?)',
            [question, answer, priority || 0, 1]
        );

        return NextResponse.json({
            success: true,
            id: result.insertId,
            message: 'FAQ created successfully'
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
    }
}
