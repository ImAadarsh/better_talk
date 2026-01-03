import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Get Total Members (Users)
        const [userRows] = await pool.execute("SELECT COUNT(*) as count FROM users");
        const memberCount = (userRows as any[])[0].count;

        // 2. Get Average Rating from Reviews
        const [reviewRows] = await pool.execute("SELECT AVG(rating) as avg_rating FROM reviews");
        const averageRating = (reviewRows as any[])[0].avg_rating || 0;

        return NextResponse.json({
            memberCount,
            averageRating: Number(averageRating)
        });

    } catch (error) {
        console.error("Public Stats API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
