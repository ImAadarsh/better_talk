import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        // Dynamic update builder
        const updates: string[] = [];
        const values: any[] = [];

        if (body.question !== undefined) {
            updates.push('question = ?');
            values.push(body.question);
        }
        if (body.answer !== undefined) {
            updates.push('answer = ?');
            values.push(body.answer);
        }
        if (body.priority !== undefined) {
            updates.push('priority = ?');
            values.push(body.priority);
        }
        if (body.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(body.is_active);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id);

        await pool.query(
            `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({ success: true, message: 'FAQ updated successfully' });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
    }
}
