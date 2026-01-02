import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch comments for a post
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get User ID
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        let userId = 0;
        if (Array.isArray(userRows) && userRows.length > 0) {
            userId = userRows[0].id;
        }

        const [rows] = await pool.execute(
            `SELECT c.id, c.content, c.created_at, u.anonymous_username, u.name as author_name, u.role as author_role, m.is_verified,
             CASE WHEN c.user_id = ? THEN 1 ELSE 0 END as is_author
       FROM group_post_comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN mentors m ON u.id = m.user_id
       WHERE c.post_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at ASC`,
            [userId, params.id]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a comment
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content } = await request.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // Get User ID
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = userRows[0].id;

        // Insert Comment
        await pool.execute(
            "INSERT INTO group_post_comments (post_id, user_id, content) VALUES (?, ?, ?)",
            [params.id, userId, content]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
