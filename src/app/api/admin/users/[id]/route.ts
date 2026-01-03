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

        const userId = params.id;

        // 1. Fetch User Basic Info
        const [userRows] = await pool.execute(
            "SELECT id, name, email, role, is_active as status, created_at, image, avatar_url, phone_number, age FROM users WHERE id = ?",
            [userId]
        ) as any[];

        if (userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userRows[0];

        // 2. Fetch User Bookings
        const [bookings] = await pool.execute(`
            SELECT 
                b.id, 
                t_user.name as therapist, 
                t_user.image as therapist_image,
                t_user.avatar_url as therapist_avatar,
                b.amount_paid_in_inr as amount, 
                b.status, 
                ms.start_time as session_start_at,
                b.created_at
            FROM bookings b
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users t_user ON m.user_id = t_user.id
            LEFT JOIN mentor_slots ms ON b.mentor_slot_id = ms.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [userId]) as any[];

        // 3. Fetch User Messages (Contact Form)
        const [messages] = await pool.execute(
            "SELECT id, subject, message, created_at FROM contact_messages WHERE email = ? ORDER BY created_at DESC",
            [user.email]
        ) as any[];

        // 4. Fetch User Chats Activity (if any)
        const [chats] = await pool.execute(`
            SELECT c.id, c.chat_start_at, c.chat_end_at, c.is_active, 
            (SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_id = c.id) as message_count
            FROM chats c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, [userId]) as any[];

        return NextResponse.json({
            user,
            bookings,
            messages,
            chats
        });

    } catch (error) {
        console.error("Admin user details API error:", error);
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

        const userId = params.id;
        const { action, name, email, age, phone } = await request.json();

        if (action === "update_info") {
            const { name, email, age, phone, image } = await request.json();
            await pool.execute(
                "UPDATE users SET name = ?, email = ?, age = ?, phone_number = ?, image = ? WHERE id = ?",
                [name, email, age, phone, image, userId]
            );
            return NextResponse.json({ success: true, message: "User information updated" });
        }

        if (action === "make_admin") {
            await pool.execute("UPDATE users SET role = 'admin' WHERE id = ?", [userId]);
            return NextResponse.json({ success: true, message: "User promoted to admin" });
        }

        if (action === "demote_user") {
            await pool.execute("UPDATE users SET role = 'user' WHERE id = ?", [userId]);
            return NextResponse.json({ success: true, message: "User demoted to regular user" });
        }

        if (action === "block") {
            await pool.execute("UPDATE users SET is_active = 0 WHERE id = ?", [userId]);
            return NextResponse.json({ success: true, message: "User blocked" });
        }

        if (action === "unblock") {
            await pool.execute("UPDATE users SET is_active = 1 WHERE id = ?", [userId]);
            return NextResponse.json({ success: true, message: "User unblocked" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Admin user action API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
