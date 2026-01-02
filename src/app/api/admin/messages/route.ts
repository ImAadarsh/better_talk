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
            "SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC"
        ) as any[];

        const formattedRows = rows.map((m: any) => ({
            ...m,
            created_at: new Date(m.created_at).toLocaleString()
        }));

        return NextResponse.json(formattedRows);

    } catch (error) {
        console.error("Admin messages API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
