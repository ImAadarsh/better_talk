
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
            `SELECT m.id, u.name, m.designation, m.headlines, m.patients_treated, u.image, m.updated_at as experience_start_date 
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
            `SELECT id, start_time, end_time 
             FROM mentor_slots 
             WHERE mentor_id = ? 
             AND client_id IS NULL 
             AND start_time > NOW() 
             ORDER BY start_time ASC`,
            [mentorId]
        );

        return NextResponse.json({
            mentor,
            slots: slotRows
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
