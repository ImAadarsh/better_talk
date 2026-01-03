
import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Validation
        if (!signature || !secret) {
            return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);

        // Handle Event
        if (payload.event === "order.paid") {
            const payment = payload.payload.payment.entity;
            const orderId = payment.order_id;
            const amountPaid = payment.amount / 100; // Convert back to INR

            // Update Booking
            try {
                // Check if already confirmed
                const [bookingRows] = await pool.execute(
                    "SELECT * FROM bookings WHERE payment_reference = ?",
                    [orderId]
                ) as any[];

                if (bookingRows && bookingRows.length > 0) {
                    const booking = bookingRows[0];
                    if (booking.status !== 'confirmed') {
                        // Confirm it
                        await pool.execute(
                            "UPDATE bookings SET status = 'confirmed', amount_paid_in_inr = ?, razorpay_payment_id = ? WHERE id = ?",
                            [amountPaid, payment.id, booking.id]
                        );

                        // Send Notifications (Idempotent: if already sent, logic inside notifications mainly sends fresh email)
                        // Ideally checking if notifications sent would be better, but re-sending on webhook usually fine/rare race condition

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
                    }
                }
            } catch (err) {
                console.error("Error updating booking in webhook:", err);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
