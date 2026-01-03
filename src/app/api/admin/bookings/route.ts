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
                b.mentor_slot_id,
                b.session_status,
                b.joining_link,
                u.name as user_name, 
                u.image as user_image,
                u.avatar_url as user_avatar,
                t_user.name as mentor_name, 
                t_user.image as mentor_image,
                t_user.avatar_url as mentor_avatar,
                ms.start_time,
                ms.end_time,
                CONCAT(mp.session_duration_min, ' Min Session') as plan_name,
                mp.price_in_inr as price,
                (SELECT COUNT(*) FROM session_notes sn WHERE sn.booking_id = b.id) as has_notes,
                (SELECT id FROM chats c WHERE c.booking_id = b.id) as chat_id
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN mentors m ON b.mentor_id = m.id
            LEFT JOIN users t_user ON m.user_id = t_user.id
            LEFT JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
            LEFT JOIN mentor_plans mp ON b.mentor_plan_id = mp.id
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
