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
                m.id, 
                u.id as user_id,
                u.name, 
                u.email, 
                m.designation, 
                m.experience_years as experience, 
                m.patients_treated as patients, 
                m.is_verified, 
                u.is_active as status,
                u.image,
                u.avatar_url,
                m.created_at as applied 
            FROM mentors m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
        `) as any[];

        const formattedRows = rows.map((t: any) => ({
            ...t,
            experience: t.experience ? `${t.experience} Yrs` : "N/A",
            applied: new Date(t.applied).toLocaleDateString()
        }));

        return NextResponse.json(formattedRows);

    } catch (error) {
        console.error("Admin therapists API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
