
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET: Fetch reviews (Admin Only)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = `
            SELECT 
                r.*, 
                u.name as user_name, 
                u.image as user_image,
                m_user.name as mentor_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN mentors m ON r.mentor_id = m.id
            JOIN users m_user ON m.user_id = m_user.id
        `;

        const params: any[] = [];
        if (status) {
            query += " WHERE r.status = ?";
            params.push(status);
        }

        query += " ORDER BY r.created_at DESC";

        const [rows] = await pool.execute(query, params);
        return NextResponse.json(rows);

    } catch (error) {
        console.error("Fetch Reviews Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Submit a review (User Only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { booking_id, rating, review_text } = body;

        if (!booking_id || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get internal User ID from DB
        const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [session.user?.email]) as any[];

        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = users[0].id;

        // Verify booking ownership
        const [bookings] = await pool.execute(`
            SELECT * FROM bookings 
            WHERE id = ?
        `, [booking_id]) as any[];

        if (bookings.length === 0) {
            return NextResponse.json({ error: `Booking #${booking_id} not found locally` }, { status: 404 });
        }

        const booking = bookings[0];

        // Check User ID mismatch
        if (booking.user_id != userId) {
            return NextResponse.json({
                error: `Unauthorized: Booking User ID (${booking.user_id}) does not match Session User ID (${userId})`
            }, { status: 403 });
        }

        if (booking.session_status !== 'completed') {
            return NextResponse.json({
                error: `Cannot review session. Status is '${booking.session_status}', must be 'completed'`
            }, { status: 400 });
        }

        // Insert Review
        await pool.execute(`
            INSERT INTO reviews (booking_id, user_id, mentor_id, rating, review_text, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `, [booking_id, userId, booking.mentor_id, rating, review_text]);

        return NextResponse.json({ message: "Review submitted successfully" });

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "You have already reviewed this session" }, { status: 409 });
        }
        console.error("Submit Review Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
