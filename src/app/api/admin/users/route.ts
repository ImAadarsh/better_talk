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

        const [rows] = await pool.execute(
            "SELECT id, name, email, role, image, avatar_url, is_active as status, created_at as joined FROM users WHERE role IN ('user', 'admin') ORDER BY created_at DESC"
        ) as any[];

        const formattedRows = rows.map((u: any) => ({
            ...u,
            status: u.status === 1 ? 'active' : 'banned',
            joined: new Date(u.joined).toISOString().split('T')[0]
        }));

        return NextResponse.json(formattedRows);

    } catch (error) {
        console.error("Admin users API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
