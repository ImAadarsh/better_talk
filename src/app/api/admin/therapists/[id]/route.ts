import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mentorId = params.id;

        SELECT
        m.*,
            u.name,
            u.email,
            u.is_active as status,
            u.image,
            u.avatar_url,
            u.google_id,
            (SELECT COUNT(*) FROM reviews r WHERE r.mentor_id = m.id) as reviews_count,
                (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.mentor_id = m.id) as average_rating,
                    (SELECT COALESCE(SUM(b.amount_paid_in_inr), 0) FROM bookings b WHERE b.mentor_id = m.id AND b.session_status = 'completed') as total_revenue,
                        (SELECT COALESCE(SUM(mp.session_duration_min), 0) 
                 FROM bookings b 
                 JOIN mentor_plans mp ON b.mentor_plan_id = mp.id 
                 WHERE b.mentor_id = m.id AND b.session_status = 'completed') as total_service_minutes
            FROM mentors m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = ?
            `, [mentorId]) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
        }

        return NextResponse.json({ therapist: rows[0] });

    } catch (error) {
        console.error("Admin therapist detail API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mentorId = params.id;
        const { action, name, email, image, designation, experience, patients, bio, headlines, expertise_tags } = await request.json();

        // Get the associated user_id first
        const [mentorRows] = await pool.execute("SELECT user_id FROM mentors WHERE id = ?", [mentorId]) as any[];
        if (mentorRows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const userId = mentorRows[0].user_id;

        if (action === "update_info") {
            // Update User Table
            await pool.execute(
                "UPDATE users SET name = ?, email = ?, image = ? WHERE id = ?",
                [name, email, image, userId]
            );
            // Update Mentors Table
            await pool.execute(
                "UPDATE mentors SET designation = ?, experience_years = ?, patients_treated = ?, bio = ?, headlines = ?, expertise_tags = ? WHERE id = ?",
                [designation, experience, patients, bio, headlines, expertise_tags, mentorId]
            );
            return NextResponse.json({ success: true, message: "Therapist profile updated" });
        }

        if (action === "approve") {
            // Fetch User Details for Notification
            const [users] = await pool.execute("SELECT id, name, email FROM users WHERE id = ?", [userId]) as any[];

            await pool.execute("UPDATE mentors SET is_verified = 1 WHERE id = ?", [mentorId]);

            if (users.length > 0) {
                const { notifyTherapistApproval } = await import("@/lib/notifications");
                await notifyTherapistApproval(users[0]);
            }

            return NextResponse.json({ success: true, message: "Therapist verified" });
        }

        if (action === "block") {
            await pool.execute("UPDATE users SET is_active = 0 WHERE id = ?", [userId]);
            return NextResponse.json({ success: true, message: "Therapist account blocked" });
        }

        if (action === "unblock") {
            await pool.execute("UPDATE users SET is_active = 1 WHERE id = ?", [userId]);
            return NextResponse.json({ success: true, message: "Therapist account unblocked" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Admin therapist action API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
