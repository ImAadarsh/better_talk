
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { notifyRescheduleByTherapist, notifyRescheduleByAdmin } from '@/lib/notifications';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookingId = parseInt(params.id);
        const { newSlotId } = await request.json();

        if (!bookingId || !newSlotId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userRole = (session.user as any).role;
        const userId = (session.user as any).db_id;

        // 1. Fetch Booking & Old Slot Details
        const [bookingRows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                b.id, b.user_id, b.mentor_id, b.mentor_slot_id,
                u.email as user_email, u.name as user_name,
                m.user_id as mentor_user_id,
                mu.email as mentor_email, mu.name as mentor_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users mu ON m.user_id = mu.id
            WHERE b.id = ?
        `, [bookingId]);

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const booking = bookingRows[0];

        // 2. Authorization Check
        if (userRole !== 'admin') {
            // If not admin, must be the therapist
            if (userRole !== 'mentor' || booking.mentor_user_id !== userId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // 3. Verify New Slot Availability & Ownership
        const [slotRows] = await pool.execute<RowDataPacket[]>(`
            SELECT id, mentor_id, start_time, is_booked 
            FROM mentor_slots 
            WHERE id = ?
        `, [newSlotId]);

        if (slotRows.length === 0) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        const newSlot = slotRows[0];

        // Ensure slot belongs to the same mentor
        if (newSlot.mentor_id !== booking.mentor_id) {
            return NextResponse.json({ error: "Slot mismatch" }, { status: 400 });
        }

        if (newSlot.is_booked) {
            return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
        }

        // 4. Perform Transaction (Swap Slots)
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Free Old Slot
            await connection.execute("UPDATE mentor_slots SET is_booked = 0, client_id = NULL WHERE id = ?", [booking.mentor_slot_id]);

            // Book New Slot
            await connection.execute("UPDATE mentor_slots SET is_booked = 1, client_id = ? WHERE id = ?", [booking.user_id, newSlotId]);

            // Update Booking
            await connection.execute(
                "UPDATE bookings SET mentor_slot_id = ?, updated_at = NOW() WHERE id = ?",
                [newSlotId, bookingId]
            );

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        // 5. Send Notifications
        const newDate = new Date(newSlot.start_time);
        const user = { id: booking.user_id, email: booking.user_email, name: booking.user_name };
        const therapist = { user_id: booking.mentor_user_id, email: booking.mentor_email, name: booking.mentor_name };

        if (userRole === 'admin') {
            await notifyRescheduleByAdmin(bookingId, user, therapist, newDate);
        } else {
            // Therapist initiated
            await notifyRescheduleByTherapist(bookingId, user, newDate);
        }

        return NextResponse.json({ success: true, message: "Booking rescheduled successfully" });

    } catch (error) {
        console.error("Reschedule error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
