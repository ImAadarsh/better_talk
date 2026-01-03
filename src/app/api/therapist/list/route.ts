
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

        // Fetch all verified Therapists
        const [rows] = await pool.execute(
            `SELECT m.id, u.name, m.designation, m.headlines, m.patients_treated, u.image, u.avatar_url,
             (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE mentor_id = m.id) as average_rating 
             FROM mentors m 
             JOIN users u ON m.user_id = u.id 
             WHERE m.is_verified = 1`
        );

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
