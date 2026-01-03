
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

        const { slotId } = await req.json();

        if (!slotId) {
            return NextResponse.json({ error: "Slot ID is required" }, { status: 400 });
        }

        // 1. Get User ID
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userId = userRows[0].id;

        // 2. Get Slot Details (mentor_id, plan_id, price)
        const [slotRows] = await pool.execute(
            `SELECT ms.id, ms.mentor_id, ms.mentor_plans_id, mp.price_in_inr 
             FROM mentor_slots ms
             JOIN mentor_plans mp ON ms.mentor_plans_id = mp.id
             WHERE ms.id = ? AND ms.client_id IS NULL`,
            [slotId]
        ) as any[];

        if (!slotRows || slotRows.length === 0) {
            return NextResponse.json({ error: "Slot not available or already booked" }, { status: 409 });
        }

        const slot = slotRows[0];

        // 3. Book Slot
        await pool.execute(
            "UPDATE mentor_slots SET client_id = ?, is_booked = 1 WHERE id = ?",
            [userId, slotId]
        );

        // 4. Create Booking Record
        const [bookingResult] = await pool.execute(
            `INSERT INTO bookings (user_id, mentor_id, mentor_plan_id, mentor_slot_id, status, session_status, amount_paid_in_inr)
             VALUES (?, ?, ?, ?, 'confirmed', 'scheduled', ?)`,
            [userId, slot.mentor_id, slot.mentor_plans_id, slotId, slot.price_in_inr]
        ) as any;

        const bookingId = bookingResult.insertId;

        // 5. Send Notifications
        const [userDetails] = await pool.execute("SELECT id, name, email FROM users WHERE id = ?", [userId]) as any[];

        const [mentorDetails] = await pool.execute(`
            SELECT m.user_id, u.email, u.name 
            FROM mentors m 
            JOIN users u ON m.user_id = u.id 
            WHERE m.id = ?
        `, [slot.mentor_id]) as any[];

        if (userDetails.length > 0 && mentorDetails.length > 0) {
            const { notifyBookingCreated } = await import("@/lib/notifications");
            await notifyBookingCreated(bookingId, userDetails[0], mentorDetails[0]);
        }

        return NextResponse.json({ success: true, message: "Slot booked successfully" });

    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
