import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
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
        const userId = (userRows as any)[0].id;
        const postId = params.id;

        // Check if upvote exists
        const [existing] = await connection.execute(
            "SELECT id FROM post_upvotes WHERE post_id = ? AND user_id = ?",
            [postId, userId]
        );

        if ((existing as any).length > 0) {
            // Remove upvote
            await connection.execute(
                "DELETE FROM post_upvotes WHERE post_id = ? AND user_id = ?",
                [postId, userId]
            );
            await connection.end();
            return NextResponse.json({ upvoted: false });
        } else {
            // Add upvote
            await connection.execute(
                "INSERT INTO post_upvotes (post_id, user_id) VALUES (?, ?)",
                [postId, userId]
            );
            await connection.end();
            return NextResponse.json({ upvoted: true });
        }

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
