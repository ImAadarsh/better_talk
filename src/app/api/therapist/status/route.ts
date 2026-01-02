import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is a mentor
        const [mentors] = await pool.execute(
            `SELECT is_verified FROM mentors 
             WHERE user_id = (SELECT id FROM users WHERE email = ?)`,
            [session.user.email]
        ) as any[];

        if (mentors.length > 0) {
            return NextResponse.json({
                applied: true,
                isVerified: mentors[0].is_verified === 1
            });
        }

        return NextResponse.json({ applied: false, isVerified: false });

    } catch (error) {
        console.error("Therapist status error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
