import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const mentorId = searchParams.get("mentor_id");

        let query = "SELECT * FROM mentor_plans";
        let params = [];

        if (mentorId) {
            query += " WHERE mentor_id = ?";
            params.push(mentorId);
        }

        const [rows] = await pool.execute(query, params);
        return NextResponse.json(rows);

    } catch (error) {
        console.error("Admin plans GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { mentor_id, price_in_inr, session_duration_min, chat_window_days, is_active } = await request.json();

        if (!mentor_id || !price_in_inr || !session_duration_min) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [result] = await pool.execute(
            "INSERT INTO mentor_plans (mentor_id, price_in_inr, session_duration_min, chat_window_days, is_active) VALUES (?, ?, ?, ?, ?)",
            [mentor_id, price_in_inr, session_duration_min, chat_window_days || 0, is_active !== undefined ? is_active : 1]
        );

        return NextResponse.json({ success: true, id: (result as any).insertId });

    } catch (error) {
        console.error("Admin plans POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
