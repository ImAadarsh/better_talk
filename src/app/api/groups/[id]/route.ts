import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groupId = params.id;

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [userRows] = await connection.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        );
        // Ensure userRows is an array and has elements before accessing [0]
        if (!Array.isArray(userRows) || userRows.length === 0) {
            await connection.end();
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = (userRows as any)[0].id;

        // Fetch group details
        const [groupRows] = await connection.execute(
            "SELECT * FROM groups WHERE id = ?",
            [groupId]
        );

        if (!Array.isArray(groupRows) || groupRows.length === 0) {
            await connection.end();
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const group = (groupRows as any)[0];

        // Fetch posts (mock/empty for now or strict schema)
        // We need to check if group_posts table exists and has data.
        // Based on schema it does.
        // Fetch posts with upvote count and user status
        const [postRows] = await connection.execute(
            `SELECT p.id, p.content, p.created_at, u.anonymous_username,
       (SELECT COUNT(*) FROM post_upvotes WHERE post_id = p.id) as upvote_count,
       (SELECT COUNT(*) FROM post_upvotes WHERE post_id = p.id AND user_id = ?) as has_upvoted,
       (SELECT COUNT(*) FROM group_post_comments WHERE post_id = p.id AND is_deleted = 0) as comment_count
       FROM group_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.group_id = ? AND p.is_deleted = 0
       ORDER BY p.created_at DESC`,
            [userId, params.id]
        );

        // Check membership
        const [memberRows] = await connection.execute(
            "SELECT * FROM group_members WHERE group_id = ? AND user_id = (SELECT id FROM users WHERE email = ?)",
            [groupId, session.user?.email]
        );

        await connection.end();

        return NextResponse.json({
            group,
            posts: postRows,
            isMember: Array.isArray(memberRows) && memberRows.length > 0,
        });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
