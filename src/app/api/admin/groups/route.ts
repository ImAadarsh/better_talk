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
            SELECT g.*, u.name as creator_name 
            FROM \`groups\` g
            LEFT JOIN users u ON g.created_by = u.id
            ORDER BY g.created_at DESC
        `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Admin groups GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, slug, description } = await request.json();

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
        }

        // Get admin user id
        const [userRows] = await pool.execute("SELECT id FROM users WHERE email = ?", [session.user?.email]) as any[];
        const adminId = userRows[0]?.id;

        await pool.execute(
            "INSERT INTO \`groups\` (name, slug, description, created_by, is_active) VALUES (?, ?, ?, ?, 1)",
            [name, slug, description, adminId]
        );

        return NextResponse.json({ success: true, message: "Community created successfully" });

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }
        console.error("Admin groups POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
