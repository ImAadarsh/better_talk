import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getMentorId(email: string) {
    const [mentors] = await pool.execute(
        "SELECT id FROM mentors WHERE user_id = (SELECT id FROM users WHERE email = ?)",
        [email]
    ) as any[];
    return mentors.length > 0 ? mentors[0].id : null;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slots } = await req.json();

        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return NextResponse.json({ error: "No slots provided" }, { status: 400 });
        }

        const mentorId = await getMentorId(session.user.email);
        if (!mentorId) {
            return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }

        // Simple loop approach
        for (const slot of slots) {
            await pool.execute(
                "INSERT INTO mentor_slots (mentor_id, start_time, end_time, is_booked) VALUES (?, ?, ?, 0)",
                [mentorId, new Date(slot.start), new Date(slot.end)]
            );
        }

        return NextResponse.json({ success: true, count: slots.length });

    } catch (error) {
        console.error("Create slots error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        const mentorId = await getMentorId(session.user.email);
        if (!mentorId) {
            return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }

        if (searchParams.get("mode") === "dates") {
            const [rows] = await pool.execute(
                `SELECT DISTINCT DATE(start_time) as date 
                 FROM mentor_slots 
                 WHERE mentor_id = ? 
                 ORDER BY date ASC`,
                [mentorId]
            ) as any[];
            return NextResponse.json({ dates: rows.map((r: any) => r.date) });
        }

        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            return NextResponse.json({ error: "Missing range" }, { status: 400 });
        }


        const [slots] = await pool.execute(
            `SELECT * FROM mentor_slots 
             WHERE mentor_id = ? 
             AND start_time >= ? 
             AND end_time <= ?
             ORDER BY start_time ASC`,
            [mentorId, new Date(start), new Date(end)]
        );

        return NextResponse.json({ slots });

    } catch (error) {
        console.error("Get slots error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const mentorId = await getMentorId(session.user.email);
        if (!mentorId) {
            return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
        }

        await pool.execute(
            "DELETE FROM mentor_slots WHERE id = ? AND mentor_id = ?",
            [id, mentorId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete slot error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
