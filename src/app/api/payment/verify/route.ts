
import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 1. Update Booking Status
            // We find the booking by order_id (payment_reference)
            const [bookingRows] = await pool.execute(
                "SELECT * FROM bookings WHERE payment_reference = ?",
                [razorpay_order_id]
            ) as any[];

            if (!bookingRows || bookingRows.length === 0) {
                return NextResponse.json({ error: "Booking not found" }, { status: 404 });
            }

            const booking = bookingRows[0];

            if (booking.status === 'confirmed') {
                return NextResponse.json({ message: "Already confirmed" });
            }

            // Update status
            await pool.execute(
                "UPDATE bookings SET status = 'confirmed', amount_paid_in_inr = ?, razorpay_payment_id = ? WHERE id = ?",
                [booking.amount_paid_in_inr, razorpay_payment_id, booking.id]
            );

            // 2. Send Notifications
            // Send Notifications
            const userId = booking.user_id;
            const mentorId = booking.mentor_id;
            const bookingId = booking.id;

            const [userDetails] = await pool.execute("SELECT id, name, email FROM users WHERE id = ?", [userId]) as any[];

            const [mentorDetails] = await pool.execute(`
                SELECT m.user_id, u.email, u.name 
                FROM mentors m 
                JOIN users u ON m.user_id = u.id 
                WHERE m.id = ?
            `, [mentorId]) as any[];

            if (userDetails.length > 0 && mentorDetails.length > 0) {
                const { notifyBookingCreated } = await import("@/lib/notifications");
                await notifyBookingCreated(bookingId, userDetails[0], mentorDetails[0]);
            }

            return NextResponse.json({ success: true, message: "Payment verified and booking confirmed" });

        } else {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
