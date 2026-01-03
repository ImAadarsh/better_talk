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

        const query = `
            SELECT 
                nl.id,
                nl.type,
                nl.reference_type,
                nl.reference_id,
                nl.sent_at,
                nl.status,
                nl.error_message,
                u.name as user_name,
                u.image as user_image,
                u.avatar_url as user_avatar,
                u.email as user_email
            FROM notification_logs nl
            LEFT JOIN users u ON nl.user_id = u.id
            ORDER BY nl.sent_at DESC
            LIMIT 100
        `;

        const [rows] = await pool.execute(query) as any[];

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Admin notification logs API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
