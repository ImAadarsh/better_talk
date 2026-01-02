import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { phone, age, username, name } = await req.json();

        if (!phone || !age || !username || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists (double check)
        const [existing] = await pool.execute(
            "SELECT id FROM users WHERE email = ? OR google_id = ?",
            [session.user.email, (session.user as any).id]
        ) as any[];

        if (existing.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Insert new user
        await pool.execute(
            `INSERT INTO users (google_id, email, phone_number, age, anonymous_username, role, avatar_url, name) 
       VALUES (?, ?, ?, ?, ?, 'user', ?, ?)`,
            [(session.user as any).id, session.user.email, phone, age, username, session.user.image || null, name]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
