import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
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

        const [rows] = await connection.execute(
            `SELECT g.id, g.name, g.description, g.slug, 
       (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count,
       (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id AND gm2.user_id = ?) as is_member
       FROM groups g 
       WHERE g.is_active = 1
       ORDER BY g.created_at DESC`,
            [userId]
        );

        await connection.end();

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
