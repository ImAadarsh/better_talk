import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId, content } = await req.json();

        if (!groupId || !content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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

        await connection.execute(
            "INSERT INTO group_posts (group_id, user_id, content) VALUES (?, ?, ?)",
            [groupId, userId, content]
        );

        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
