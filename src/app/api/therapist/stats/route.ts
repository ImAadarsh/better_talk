
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get Mentor ID
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];


        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = userRows[0].id;

        const [mentorRows] = await pool.execute(
            "SELECT id FROM mentors WHERE user_id = ?",
            [userId]
        ) as any[];

        if (!Array.isArray(mentorRows) || mentorRows.length === 0) {
            return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
        }
        const mentorId = mentorRows[0].id;

        // 1. Total Patients (Count distinct clients booked)
        const [patientRows] = await pool.execute(
            "SELECT COUNT(DISTINCT client_id) as total FROM mentor_slots WHERE mentor_id = ? AND is_booked = 1",
            [mentorId]
        ) as any[];
        const totalPatients = patientRows[0].total;

        // 2. Upcoming Sessions Count && Next Session
        const [sessionRows] = await pool.execute(
            `SELECT ms.start_time, u.name as client_name
             FROM mentor_slots ms
             JOIN users u ON ms.client_id = u.id
             WHERE ms.mentor_id = ? AND ms.is_booked = 1 AND ms.start_time > NOW()
             ORDER BY ms.start_time ASC`,
            [mentorId]
        ) as any[];

        const upcomingSessions = sessionRows;
        const upcomingSessionsCount = upcomingSessions.length;
        const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

        return NextResponse.json({
            totalPatients,
            upcomingSessionsCount,
            nextSession
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
