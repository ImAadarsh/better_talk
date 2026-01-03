import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const mentorId = searchParams.get("mentor_id");
        const userId = searchParams.get("user_id");

        let query = `
            SELECT 
                b.id, 
                u.name as user, 
                u.image as user_image,
                u.avatar_url as user_avatar,
                t_user.name as therapist, 
                t_user.image as therapist_image,
                t_user.avatar_url as therapist_avatar,
                DATE_FORMAT(ms.start_time, '%Y-%m-%d') as date, 
                DATE_FORMAT(ms.start_time, '%h:%i %p') as time, 
                b.amount_paid_in_inr as amount, 
                b.status 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users t_user ON m.user_id = t_user.id
            LEFT JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
        `;

        const params: any[] = [];
        if (mentorId) {
            query += " WHERE b.mentor_id = ?";
            params.push(mentorId);
        } else if (userId) {
            query += " WHERE b.user_id = ?";
            params.push(userId);
        }

        query += " ORDER BY b.created_at DESC";

        const [rows] = await pool.execute(query, params) as any[];

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Admin bookings API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
