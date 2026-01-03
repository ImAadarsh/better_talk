import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chatId = params.id;

        // Get user ID
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = userRows[0].id;

        // Fetch chat details - verify user is participant
        const [chatRows] = await pool.execute(
            `SELECT c.id, c.booking_id, c.chat_start_at, c.chat_end_at, c.is_active,
                    u.name as other_party_name, u.image as other_party_image
             FROM chats c
             JOIN users u ON (c.user_id = ? AND u.id = c.mentor_id) OR (c.mentor_id IN (SELECT id FROM mentors WHERE user_id = ?) AND u.id = c.user_id)
             WHERE c.id = ? AND (c.user_id = ? OR c.mentor_id IN (SELECT id FROM mentors WHERE user_id = ?))`,
            [userId, userId, chatId, userId, userId]
        ) as any[];

        if (chatRows.length === 0) {
            return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
        }

        const chat = chatRows[0];

        // Check if chat has expired
        const now = new Date();
        const chatEndAt = new Date(chat.chat_end_at);
        const isExpired = now > chatEndAt;

        return NextResponse.json({
            ...chat,
            isExpired
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
