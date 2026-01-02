
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get User ID and Role
        const [userRows] = await pool.execute(
            "SELECT id, role FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const user = userRows[0];
        const userId = user.id;
        const role = user.role;

        let query = "";
        let params: any[] = [];

        if (role === 'mentor') {
            // If Mentor: Fetch slots where they are the mentor AND is_booked = 1
            // Join with users (as client)
            const [mentorRows] = await pool.execute(
                "SELECT id FROM mentors WHERE user_id = ?",
                [userId]
            ) as any[];

            if (mentorRows.length === 0) {
                return NextResponse.json({ sessions: [] });
            }
            const mentorId = mentorRows[0].id;

            query = `
                SELECT ms.id, ms.start_time, ms.end_time,
                       u.name as other_party_name, u.image as other_party_image, 'Client' as other_party_role
                FROM mentor_slots ms
                JOIN users u ON ms.client_id = u.id
                WHERE ms.mentor_id = ? AND ms.is_booked = 1
                ORDER BY ms.start_time ASC
            `;
            params = [mentorId];

        } else {
            // If User: Fetch slots where they are the client
            // Join with mentors -> users (as mentor)
            query = `
                SELECT ms.id, ms.start_time, ms.end_time,
                       u.name as other_party_name, u.image as other_party_image, m.designation as other_party_role
                FROM mentor_slots ms
                JOIN mentors m ON ms.mentor_id = m.id
                JOIN users u ON m.user_id = u.id
                WHERE ms.client_id = ?
                ORDER BY ms.start_time ASC
            `;
            params = [userId];
        }

        const [sessionRows] = await pool.execute(query, params);

        return NextResponse.json(sessionRows);

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
