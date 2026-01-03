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

        // Get user ID and check role
        const [userRows] = await pool.execute(
            "SELECT id, role, email, name FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const currentUser = userRows[0];
        const isMentor = currentUser.role === 'mentor';
        const isAdmin = currentUser.role === 'admin';

        if (!isMentor && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        let mentorIdToCheck = null;
        if (isMentor) {
            // Get mentor ID
            const [mentorRows] = await pool.execute(
                "SELECT id FROM mentors WHERE user_id = ?",
                [currentUser.id]
            ) as any[];

            if (mentorRows.length === 0) {
                return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
            }
            mentorIdToCheck = mentorRows[0].id;
        }

        // Update joining link
        let query = "UPDATE bookings SET joining_link = ? WHERE id = ?";
        let paramsArray: any[] = [joiningLink.trim(), bookingId];

        if (isMentor && mentorIdToCheck) {
            query += " AND mentor_id = ?";
            paramsArray.push(mentorIdToCheck);
        }

        const [result] = await pool.execute(query, paramsArray) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
        }

        // Notifications
        // Fetch Booking Details (User and Mentor info)
        const [bookingRows] = await pool.execute(`
            SELECT b.user_id, b.mentor_id, 
                   u.email as user_email, u.name as user_name,
                   mu.email as mentor_email, mu.name as mentor_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users mu ON m.user_id = mu.id
            WHERE b.id = ?
        `, [bookingId]) as any[];

        if (bookingRows.length > 0) {
            const booking = bookingRows[0];
            const { notifyJoiningLinkAddedByTherapist, notifyJoiningLinkAddedByAdmin } = await import("@/lib/notifications");

            const userObj = { id: booking.user_id, email: booking.user_email, name: booking.user_name };
            const mentorObj = { user_id: 0, email: booking.mentor_email, name: booking.mentor_name }; // user_id not fetched/needed for this call structure?

            if (isMentor) {
                await notifyJoiningLinkAddedByTherapist(parseInt(bookingId), userObj, joiningLink);
            } else if (isAdmin) {
                await notifyJoiningLinkAddedByAdmin(parseInt(bookingId), userObj, mentorObj, joiningLink);
            }
        }

        return NextResponse.json({ success: true, message: "Joining link updated successfully" });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
