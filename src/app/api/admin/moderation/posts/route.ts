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
            SELECT p.*, u.name as author_name, u.role as author_role, g.name as group_name
            FROM group_posts p
            JOIN users u ON p.user_id = u.id
            JOIN \`groups\` g ON p.group_id = g.id
            WHERE p.is_deleted = 0
            ORDER BY p.created_at DESC
        `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Admin posts moderation GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Soft delete
        await pool.execute("UPDATE group_posts SET is_deleted = 1 WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Post deleted" });
    } catch (error) {
        console.error("Admin post DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, content } = await request.json();

        if (!id || !content) {
            return NextResponse.json({ error: "Missing ID or content" }, { status: 400 });
        }

        await pool.execute("UPDATE group_posts SET content = ? WHERE id = ?", [content, id]);

        return NextResponse.json({ success: true, message: "Post content updated" });
    } catch (error) {
        console.error("Admin post PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
