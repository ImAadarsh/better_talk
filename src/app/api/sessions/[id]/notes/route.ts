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

        const slotId = params.id;

        // Get user ID and role
        const [userRows] = await pool.execute(
            "SELECT id, role FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const user = userRows[0];

        let notesRows;

        // If admin, they can fetch notes for any session
        if (user.role === 'admin') {
            [notesRows] = await pool.execute(
                `SELECT sn.notes_text, sn.updated_at
                 FROM session_notes sn
                 JOIN bookings b ON sn.booking_id = b.id
                 JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
                 WHERE ms.id = ?`,
                [slotId]
            ) as any[];
        }
        // If therapist, get mentor_id and fetch notes for their sessions
        else if (user.role === 'mentor') {
            const [mentorRows] = await pool.execute(
                "SELECT id FROM mentors WHERE user_id = ?",
                [user.id]
            ) as any[];

            if (mentorRows.length === 0) {
                return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
            }
            const mentorId = mentorRows[0].id;

            // Fetch notes for therapist's own sessions
            [notesRows] = await pool.execute(
                `SELECT sn.notes_text, sn.updated_at
                 FROM session_notes sn
                 JOIN bookings b ON sn.booking_id = b.id
                 JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
                 WHERE ms.id = ? AND b.mentor_id = ?`,
                [slotId, mentorId]
            ) as any[];
        } else {
            // Fetch notes for client
            [notesRows] = await pool.execute(
                `SELECT sn.notes_text, sn.updated_at
                 FROM session_notes sn
                 JOIN bookings b ON sn.booking_id = b.id
                 JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
                 WHERE ms.id = ? AND ms.client_id = ?`,
                [slotId, user.id]
            ) as any[];
        }

        if (notesRows.length === 0) {
            return NextResponse.json({ notes_text: null });
        }

        return NextResponse.json(notesRows[0]);

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

        const slotId = params.id;
        const { notes } = await req.json();

        if (!notes || notes.trim().length === 0) {
            return NextResponse.json({ error: "Notes cannot be empty" }, { status: 400 });
        }

        // Get user ID and check if therapist
        const [userRows] = await pool.execute(
            "SELECT id, role FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const user = userRows[0];

        // Get mentor ID if therapist
        if (user.role !== 'mentor') {
            return NextResponse.json({ error: "Only therapists can add notes" }, { status: 403 });
        }

        const [mentorRows] = await pool.execute(
            "SELECT id FROM mentors WHERE user_id = ?",
            [user.id]
        ) as any[];

        if (mentorRows.length === 0) {
            return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }
        const mentorId = mentorRows[0].id;

        // Get booking details and verify therapist owns this session
        const [bookingRows] = await pool.execute(
            `SELECT b.id, b.user_id, b.mentor_id
             FROM bookings b
             JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
             WHERE ms.id = ? AND b.mentor_id = ?`,
            [slotId, mentorId]
        ) as any[];

        if (bookingRows.length === 0) {
            return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
        }

        const booking = bookingRows[0];

        // Insert or update notes
        await pool.execute(
            `INSERT INTO session_notes (booking_id, mentor_id, user_id, notes_text)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE notes_text = ?, updated_at = CURRENT_TIMESTAMP`,
            [booking.id, mentorId, booking.user_id, notes.trim(), notes.trim()]
        );

        return NextResponse.json({ success: true, message: "Notes saved successfully" });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
