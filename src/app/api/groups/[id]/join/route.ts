import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groupId = params.id;
        const { action } = await req.json(); // 'join' or 'leave'

        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = userRows[0].id;

        if (action === 'join') {
            await pool.execute(
                "INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)",
                [groupId, userId]
            );
        } else {
            await pool.execute(
                "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
                [groupId, userId]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
