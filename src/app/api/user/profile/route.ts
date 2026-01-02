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
            "SELECT id, email, anonymous_username, age, avatar_url, bio, role, created_at FROM users WHERE email = ?",
            [session.user?.email]
        );

        if ((userRows as any).length === 0) {
            await connection.end();
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = (userRows as any)[0];
        const userId = user.id;

        // Fetch joined groups
        const [groupRows] = await connection.execute(
            `SELECT g.id, g.name, g.description, g.slug, 
       (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = ? AND g.is_active = 1`,
            [userId]
        );

        await connection.end();

        return NextResponse.json({ user, groups: groupRows });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { bio, age } = await request.json();

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        if (age !== undefined) {
            await connection.execute(
                "UPDATE users SET bio = ?, age = ? WHERE email = ?",
                [bio, age, session.user?.email]
            );
        } else {
            await connection.execute(
                "UPDATE users SET bio = ? WHERE email = ?",
                [bio, session.user?.email]
            );
        }

        await connection.end();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
