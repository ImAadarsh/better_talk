import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch top 6 active groups by member count
        const [rows] = await pool.execute(
            `SELECT g.id, g.name, g.description, g.slug, 
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
            FROM groups g 
            WHERE g.is_active = 1
            ORDER BY member_count DESC, g.id DESC
            LIMIT 6`
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
