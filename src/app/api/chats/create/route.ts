import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
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

        // Get booking details with slot and plan info
        // Support both clients (user_id) and therapists (mentor_id via mentors table)
        const [bookingRows] = await pool.execute(
            `SELECT b.id, b.user_id, b.mentor_id, ms.end_time, mp.chat_window_days
             FROM bookings b
             JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
             JOIN mentor_plans mp ON b.mentor_plan_id = mp.id
             LEFT JOIN mentors m ON b.mentor_id = m.id
             WHERE b.id = ? AND (b.user_id = ? OR m.user_id = ?)`,
            [bookingId, userId, userId]
        ) as any[];

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
        }

        const booking = bookingRows[0];

        // Check if chat already exists
        const [existingChat] = await pool.execute(
            "SELECT id, chat_end_at FROM chats WHERE booking_id = ?",
            [bookingId]
        ) as any[];

        if (existingChat.length > 0) {
            return NextResponse.json({ chatId: existingChat[0].id, chatEndAt: existingChat[0].chat_end_at });
        }

        // Calculate chat window
        const chatStartAt = new Date(booking.end_time);
        const chatEndAt = addDays(chatStartAt, booking.chat_window_days);

        // Create new chat
        const [result] = await pool.execute(
            `INSERT INTO chats (booking_id, user_id, mentor_id, chat_start_at, chat_end_at, is_active)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [bookingId, booking.user_id, booking.mentor_id, chatStartAt, chatEndAt]
        ) as any;

        // Send Chat Started Notification
        const [users] = await pool.execute(
            `SELECT id, name, email FROM users WHERE id IN (?, ?)`,
            [booking.user_id, (await pool.execute("SELECT user_id FROM mentors WHERE id = ?", [booking.mentor_id]) as any[])[0][0].user_id]
        ) as any[];

        const initiatorEmail = session.user?.email;
        const recipient = users.find((u: any) => u.email !== initiatorEmail);

        if (recipient) {
            const { sendManualNotification } = await import("@/lib/notifications"); // Reuse manual or create specific
            // The prompt says "Email Notification ... when someone start the chat session"
            await sendManualNotification(
                recipient.email,
                "New Chat Session Started",
                `A new chat session has been started for your booking #${bookingId}. Log in to view messages.`,
                recipient.id
            );
        }

        return NextResponse.json({
            chatId: result.insertId,
            chatEndAt: chatEndAt.toISOString()
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
