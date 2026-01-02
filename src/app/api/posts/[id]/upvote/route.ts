import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = userRows[0].id;
        const postId = params.id;

        // Check if upvote exists
        const [existing] = await pool.execute(
            "SELECT id FROM post_upvotes WHERE post_id = ? AND user_id = ?",
            [postId, userId]
        ) as any[];


        if (existing.length > 0) {
            // Remove upvote
            await pool.execute(
                "DELETE FROM post_upvotes WHERE post_id = ? AND user_id = ?",
                [postId, userId]
            );
            return NextResponse.json({ upvoted: false });
        } else {
            // Add upvote
            await pool.execute(
                "INSERT INTO post_upvotes (post_id, user_id) VALUES (?, ?)",
                [postId, userId]
            );
            return NextResponse.json({ upvoted: true });
        }

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
