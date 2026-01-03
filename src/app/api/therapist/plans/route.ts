import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get mentor ID
        const [mentors] = await pool.execute(
            "SELECT id FROM mentors WHERE user_id = (SELECT id FROM users WHERE email = ?)",
            [session.user.email]
        ) as any[];

        if (mentors.length === 0) {
            return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
        }

        const mentorId = mentors[0].id;

        const [plans] = await pool.execute(
            "SELECT * FROM mentor_plans WHERE mentor_id = ? AND is_active = 1",
            [mentorId]
        );

        return NextResponse.json(plans);

    } catch (error) {
        console.error("Therapist plans GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
