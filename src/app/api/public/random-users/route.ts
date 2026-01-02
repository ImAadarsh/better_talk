import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute(
            "SELECT id, avatar_url FROM users WHERE avatar_url IS NOT NULL ORDER BY RAND() LIMIT 6"
        ) as any[];

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Public random users error:", error);
        return NextResponse.json([]);
    }
}
