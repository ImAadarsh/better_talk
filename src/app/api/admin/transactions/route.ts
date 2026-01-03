
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) { // Add admin check logic here if available
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // In a real app, verify session.user.role === 'admin'

        const [bookings] = await pool.execute(`
            SELECT 
                b.id,
                b.created_at,
                b.status,
                b.amount_paid_in_inr,
                b.payment_reference,
                b.razorpay_payment_id,
                b.failure_reason,
                u.name as user_name,
                u.email as user_email,
                m_user.name as mentor_name,
                ms.start_time
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users m_user ON m.user_id = m_user.id
            LEFT JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
            ORDER BY b.created_at DESC
        `);

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { bookingId, status } = await req.json();

        if (!['pending', 'confirmed', 'cancelled', 'expired'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Update booking
        await pool.execute(
            "UPDATE bookings SET status = ? WHERE id = ?",
            [status, bookingId]
        );

        // If cancelled or expired, release slot
        if (status === 'cancelled' || status === 'expired') {
            // Find slot id
            const [rows] = await pool.execute("SELECT mentor_slot_id FROM bookings WHERE id = ?", [bookingId]) as any[];
            if (rows.length > 0 && rows[0].mentor_slot_id) {
                await pool.execute("UPDATE mentor_slots SET is_booked = 0, client_id = NULL WHERE id = ?", [rows[0].mentor_slot_id]);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update Transaction Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get("id");

        if (!bookingId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Check if pending
        const [rows] = await pool.execute("SELECT status, mentor_slot_id FROM bookings WHERE id = ?", [bookingId]) as any[];

        if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Technically admin can delete any, but let's be safe and auto-release slot if it was holding one
        const booking = rows[0];

        // Release slot if it exists
        if (booking.mentor_slot_id) {
            await pool.execute("UPDATE mentor_slots SET is_booked = 0, client_id = NULL WHERE id = ?", [booking.mentor_slot_id]);
        }

        // Delete booking
        await pool.execute("DELETE FROM bookings WHERE id = ?", [bookingId]);

        return NextResponse.json({ success: true, message: "Booking deleted" });

    } catch (error) {
        console.error("Delete Transaction Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
