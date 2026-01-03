
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { bookingId, reason } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        // 1. Get Booking Details
        const [bookingRows] = await pool.execute(
            "SELECT * FROM bookings WHERE id = ?",
            [bookingId]
        ) as any[];

        if (!bookingRows || bookingRows.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const booking = bookingRows[0];

        // Ensure user owns this booking
        const [userRows] = await pool.execute("SELECT id FROM users WHERE email = ?", [session.user?.email]) as any[];

        if (userRows[0].id !== booking.user_id) {
            return NextResponse.json({ error: "Unauthorized access to booking" }, { status: 403 });
        }

        // Only allow cancellation if pending
        if (booking.status !== 'pending') {
            // If confirmed, this needs refined refund logic (out of scope for now, usually manual)
            // But valid for abandoned checkout which is 'pending'
            return NextResponse.json({ message: "Booking is not pending, cannot auto-cancel" }, { status: 400 });
        }

        // 2. Mark Booking Cancelled
        await pool.execute(
            "UPDATE bookings SET status = 'cancelled', failure_reason = ? WHERE id = ?",
            [reason || "User cancelled payment", bookingId]
        );

        // 3. Release Slot
        if (booking.mentor_slot_id) {
            await pool.execute(
                "UPDATE mentor_slots SET is_booked = 0, client_id = NULL WHERE id = ?",
                [booking.mentor_slot_id]
            );
        }

        return NextResponse.json({ success: true, message: "Booking cancelled and slot released" });

    } catch (error) {
        console.error("Cancellation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
