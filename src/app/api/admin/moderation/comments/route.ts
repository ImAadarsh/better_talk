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
            SELECT c.*, u.name as author_name, u.role as author_role, p.content as post_content
            FROM group_post_comments c
            JOIN users u ON c.user_id = u.id
            JOIN group_posts p ON c.post_id = p.id
            WHERE c.is_deleted = 0
            ORDER BY c.created_at DESC
        `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Admin comments moderation GET error:", error);
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
        await pool.execute("UPDATE group_post_comments SET is_deleted = 1 WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Comment deleted" });
    } catch (error) {
        console.error("Admin comment DELETE error:", error);
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

        await pool.execute("UPDATE group_post_comments SET content = ? WHERE id = ?", [content, id]);

        return NextResponse.json({ success: true, message: "Comment content updated" });
    } catch (error) {
        console.error("Admin comment PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
