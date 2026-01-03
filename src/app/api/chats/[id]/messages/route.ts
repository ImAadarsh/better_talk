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
            "SELECT id, role FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const user = userRows[0];
        const userId = user.id;

        // Verify user is participant in this chat, or an admin
        if (user.role !== 'admin') {
            const [chatRows] = await pool.execute(
                `SELECT id FROM chats 
                 WHERE id = ? AND (user_id = ? OR mentor_id IN (SELECT id FROM mentors WHERE user_id = ?))`,
                [chatId, userId, userId]
            ) as any[];

            if (chatRows.length === 0) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        }

        const [messages] = await pool.execute(
            `SELECT cm.id, cm.message_text, cm.sent_at, cm.sender_id,
                    u.name as sender_name, u.image as sender_image
             FROM chat_messages cm
             LEFT JOIN users u ON cm.sender_id = u.id
             WHERE cm.chat_id = ?
             ORDER BY cm.sent_at ASC`,
            [chatId]
        );

        return NextResponse.json(messages);

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const chatId = params.id;
        const { message } = await req.json();

        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
        }

        // Get user ID
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = userRows[0].id;

        // Verify chat exists, user is participant, and chat hasn't expired
        const [chatRows] = await pool.execute(
            `SELECT id, chat_end_at FROM chats 
             WHERE id = ? AND (user_id = ? OR mentor_id IN (SELECT id FROM mentors WHERE user_id = ?))`,
            [chatId, userId, userId]
        ) as any[];

        if (chatRows.length === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const chat = chatRows[0];
        const now = new Date();
        const chatEndAt = new Date(chat.chat_end_at);

        if (now > chatEndAt) {
            return NextResponse.json({ error: "Chat window has expired" }, { status: 410 });
        }

        // Insert message
        const [result] = await pool.execute(
            `INSERT INTO chat_messages (chat_id, sender_id, message_text, sent_at)
             VALUES (?, ?, ?, NOW())`,
            [chatId, userId, message.trim()]
        ) as any;

        // Fetch the created message with sender info
        const [newMessage] = await pool.execute(
            `SELECT cm.id, cm.message_text, cm.sent_at, cm.sender_id,
                    u.name as sender_name, u.image as sender_image
             FROM chat_messages cm
             JOIN users u ON cm.sender_id = u.id
             WHERE cm.id = ?`,
            [result.insertId]
        ) as any[];

        return NextResponse.json(newMessage[0]);

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
