import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
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

        if (action === 'join') {
            await connection.execute(
                "INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)",
                [groupId, userId]
            );
        } else {
            await connection.execute(
                "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
                [groupId, userId]
            );
        }

        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
