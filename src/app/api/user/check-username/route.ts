import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        if (!username || username.length < 3) {
            return NextResponse.json({ available: false, error: "Username too short" });
        }

        const [rows] = await pool.execute(
            "SELECT id FROM users WHERE anonymous_username = ?",
            [username]
        ) as any[];

        if (rows.length > 0) {
            return NextResponse.json({ available: false });
        } else {
            return NextResponse.json({ available: true });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
