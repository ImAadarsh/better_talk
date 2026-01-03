import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookingId = params.id;
        const { joiningLink } = await req.json();

        if (!joiningLink || joiningLink.trim().length === 0) {
            return NextResponse.json({ error: "Joining link cannot be empty" }, { status: 400 });
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

        if (user.role !== 'mentor') {
            return NextResponse.json({ error: "Only therapists can update joining links" }, { status: 403 });
        }

        // Get mentor ID
        const [mentorRows] = await pool.execute(
            "SELECT id FROM mentors WHERE user_id = ?",
            [user.id]
        ) as any[];

        if (mentorRows.length === 0) {
            return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }
        const mentorId = mentorRows[0].id;

        // Update joining link - verify therapist owns this booking
        const [result] = await pool.execute(
            `UPDATE bookings 
             SET joining_link = ? 
             WHERE id = ? AND mentor_id = ?`,
            [joiningLink.trim(), bookingId, mentorId]
        ) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Joining link updated successfully" });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
