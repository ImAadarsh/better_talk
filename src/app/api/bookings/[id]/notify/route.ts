import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendManualNotification } from "@/lib/notifications";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookingId = params.id;
        const { type } = await req.json(); // type: 'notify_user' | 'notify_both'

        // Get user details
        const [userRows] = await pool.execute(
            "SELECT id, role, email FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const currentUser = userRows[0];
        const isMentor = currentUser.role === 'mentor';
        const isAdmin = currentUser.role === 'admin';

        if (!isMentor && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Fetch booking participants
        const [bookingRows] = await pool.execute(`
            SELECT b.user_id, b.mentor_id, 
                   u.email as user_email, u.name as user_name, u.id as u_id,
                   mu.email as mentor_email, mu.name as mentor_name, mu.id as m_user_id
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users mu ON m.user_id = mu.id
            WHERE b.id = ?
        `, [bookingId]) as any[];

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const booking = bookingRows[0];

        // If mentor, verify ownership
        if (isMentor) {
            const [mentorRows] = await pool.execute("SELECT id FROM mentors WHERE user_id = ?", [currentUser.id]) as any[];
            if (mentorRows.length === 0 || mentorRows[0].id !== booking.mentor_id) {
                return NextResponse.json({ error: "Unauthorized for this booking" }, { status: 403 });
            }
        }

        const results = [];

        if (type === 'notify_user' || type === 'notify_both') {
            const res = await sendManualNotification(
                booking.user_email,
                "Booking Update - BetterTalk",
                `You have a notification regarding your booking #${bookingId}. Please check the dashboard.`,
                booking.u_id
            );
            results.push({ target: 'user', success: res.success });
        }

        if (type === 'notify_both' && isAdmin) {
            const res = await sendManualNotification(
                booking.mentor_email,
                "Booking Update - BetterTalk",
                `You have a notification regarding booking #${bookingId}. Please check the dashboard.`,
                booking.m_user_id
            );
            results.push({ target: 'therapist', success: res.success });
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error("Manual notification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
