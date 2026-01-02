import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = userRows[0].id;

        const [rows] = await pool.execute(
            `SELECT g.id, g.name, g.description, g.slug, 
       (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
       (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.user_id = ?) as is_member
       FROM groups g 
       WHERE g.is_active = 1
       ORDER BY g.created_at DESC`,
            [userId]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
