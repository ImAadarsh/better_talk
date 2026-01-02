import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [userRows] = await pool.execute(
            "SELECT id, email, anonymous_username, age, avatar_url, bio, role, created_at FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];


        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userRows[0];
        const userId = user.id;

        // Fetch joined groups
        const [groupRows] = await pool.execute(
            `SELECT g.id, g.name, g.description, g.slug, 
       (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) as member_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = ? AND g.is_active = 1`,
            [userId]
        );

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

        if (age !== undefined) {
            await pool.execute(
                "UPDATE users SET bio = ?, age = ? WHERE email = ?",
                [bio, age, session.user?.email]
            );
        } else {
            await pool.execute(
                "UPDATE users SET bio = ? WHERE email = ?",
                [bio, session.user?.email]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
