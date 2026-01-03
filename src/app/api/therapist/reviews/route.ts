import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get internal User ID
        const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [session.user?.email]) as any[];
        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = users[0].id;

        // Get Mentor ID
        const [mentors] = await pool.execute("SELECT id FROM mentors WHERE user_id = ?", [userId]) as any[];
        if (mentors.length === 0) {
            return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }
        const mentorId = mentors[0].id;

        // Fetch reviews
        const query = `
            SELECT 
                r.id,
                r.rating,
                r.review_text,
                r.created_at,
                u.name as reviewer_name,
                u.image as reviewer_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.mentor_id = ?
            ORDER BY r.created_at DESC
        `;

        const [reviews] = await pool.execute(query, [mentorId]);

        return NextResponse.json(reviews);

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
