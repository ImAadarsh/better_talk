import { NextResponse } from "next/server";
import pool from "@/lib/db";
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

        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        // Ensure userRows is an array and has elements before accessing [0]
        if (!Array.isArray(userRows) || userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = userRows[0].id;

        // Fetch group details
        const [groupRows] = await pool.execute(
            "SELECT * FROM groups WHERE id = ?",
            [groupId]
        ) as any[];

        if (!Array.isArray(groupRows) || groupRows.length === 0) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const group = groupRows[0];

        // Fetch posts with upvote count and user status
        const [postRows] = await pool.execute(
            `SELECT p.id, p.content, p.created_at, 
       u.anonymous_username, u.name as author_name, u.role as author_role,
       m.is_verified,
       (SELECT COUNT(*) FROM post_upvotes WHERE post_id = p.id) as upvote_count,
       (SELECT COUNT(*) FROM post_upvotes WHERE post_id = p.id AND user_id = ?) as has_upvoted,
       (SELECT COUNT(*) FROM group_post_comments WHERE post_id = p.id AND is_deleted = 0) as comment_count,
       CASE WHEN p.user_id = ? THEN 1 ELSE 0 END as is_author
       FROM group_posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN mentors m ON u.id = m.user_id
       WHERE p.group_id = ? AND p.is_deleted = 0
       ORDER BY p.created_at DESC`,
            [userId, userId, params.id]
        );

        // Check membership
        const [memberRows] = await pool.execute(
            "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
            [groupId, userId]
        ) as any[];

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
