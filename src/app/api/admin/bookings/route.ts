import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [rows] = await pool.execute(`
            SELECT 
                b.id, 
                u.name as user, 
                t_user.name as therapist, 
                DATE_FORMAT(b.session_start_at, '%Y-%m-%d') as date, 
                DATE_FORMAT(b.session_start_at, '%h:%i %p') as time, 
                b.amount_paid_in_inr as amount, 
                b.status 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users t_user ON m.user_id = t_user.id
            ORDER BY b.created_at DESC
        `) as any[];


        return NextResponse.json(rows);

    } catch (error) {
        console.error("Admin bookings API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
