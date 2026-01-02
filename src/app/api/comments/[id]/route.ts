import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content } = await request.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // Check ownership
        const [rows] = await pool.execute(
            `SELECT id FROM group_post_comments WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)`,
            [params.id, session.user.email]
        ) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 403 });
        }

        // Update
        await pool.execute(
            "UPDATE group_post_comments SET content = ? WHERE id = ?",
            [content, params.id]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update comment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
