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
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookingId = params.id;

        // Get complete booking details
        const [bookingRows] = await pool.execute(
            `SELECT 
                b.id,
                b.user_id,
                b.mentor_id,
                b.mentor_plan_id,
                b.mentor_slot_id,
                b.session_status,
                b.joining_link,
                b.created_at,
                u.name as user_name,
                u.email as user_email,
                u.image as user_image,
                u.avatar_url as user_avatar,
                mu.name as mentor_name,
                mu.email as mentor_email,
                mu.image as mentor_image,
                mu.avatar_url as mentor_avatar,
                ms.start_time,
                ms.end_time,
                CONCAT(mp.session_duration_min, ' Min Session') as plan_name,
                mp.price_in_inr as price,
                mp.chat_window_days,
                (SELECT COUNT(*) FROM session_notes sn WHERE sn.booking_id = b.id) as has_notes,
                (SELECT id FROM chats c WHERE c.booking_id = b.id) as chat_id,
                (SELECT chat_end_at FROM chats c WHERE c.booking_id = b.id) as chat_end_at
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN mentors m ON b.mentor_id = m.id
             JOIN users mu ON m.user_id = mu.id
             JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
             JOIN mentor_plans mp ON b.mentor_plan_id = mp.id
             WHERE b.id = ?`,
            [bookingId]
        ) as any[];

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const booking = bookingRows[0];

        // Check if chat is expired
        let chatExpired = true;
        if (booking.chat_end_at) {
            chatExpired = new Date() > new Date(booking.chat_end_at);
        }

        return NextResponse.json({
            ...booking,
            chat_expired: chatExpired
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
