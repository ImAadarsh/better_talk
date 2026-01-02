import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
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

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(
            `SELECT c.id, c.content, c.created_at, u.anonymous_username 
       FROM group_post_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at ASC`,
            [params.id]
        );

        await connection.end();
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

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Get User ID
        const [userRows] = await connection.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        );
        const userId = (userRows as any)[0].id;

        // Insert Comment
        await connection.execute(
            "INSERT INTO group_post_comments (post_id, user_id, content) VALUES (?, ?, ?)",
            [params.id, userId, content]
        );

        await connection.end();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
