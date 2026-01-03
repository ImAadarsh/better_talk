
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mentorId = params.id;

        // 1. Fetch Mentor Details
        const [mentorRows] = await pool.execute(
            `SELECT m.id, u.name, m.designation, m.headlines, m.patients_treated, m.experience_years, u.image, m.updated_at as experience_start_date,
             (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE mentor_id = m.id) as average_rating 
             FROM mentors m 
             JOIN users u ON m.user_id = u.id 
             WHERE m.id = ?`,
            [mentorId]
        ) as any[];

        if (mentorRows.length === 0) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        const mentor = mentorRows[0];

        // 2. Fetch Available Slots (Future only, Unbooked)
        const [slotRows] = await pool.execute(
            `SELECT s.id, s.start_time, s.end_time, p.price_in_inr, p.session_duration_min 
             FROM mentor_slots s
             JOIN mentor_plans p ON s.mentor_plans_id = p.id
             WHERE s.mentor_id = ? 
             AND s.client_id IS NULL 
             AND s.start_time > NOW() 
             ORDER BY s.start_time ASC`,
            [mentorId]
        );

        // 3. Fetch Active Plans
        const [planRows] = await pool.execute(
            "SELECT * FROM mentor_plans WHERE mentor_id = ? AND is_active = 1",
            [mentorId]
        );

        return NextResponse.json({
            mentor,
            slots: slotRows,
            plans: planRows
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
