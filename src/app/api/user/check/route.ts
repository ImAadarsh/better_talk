import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const [rows] = await pool.execute(
            "SELECT id, anonymous_username FROM users WHERE email = ?",
            [email]
        ) as any[];

        if (rows.length > 0) {
            return NextResponse.json({ exists: true, user: rows[0] });
        } else {
            return NextResponse.json({ exists: false });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
