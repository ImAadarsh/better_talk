import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [rows] = await pool.execute("SELECT * FROM stories WHERE is_active = 1 ORDER BY created_at DESC");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Public Stories GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
