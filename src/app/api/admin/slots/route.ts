import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const mentorId = searchParams.get("mentor_id");

        if (!mentorId) {
            return NextResponse.json({ error: "mentor_id is required" }, { status: 400 });
        }

        const [rows] = await pool.execute(`
            SELECT s.*, p.session_duration_min, p.price_in_inr 
            FROM mentor_slots s
            JOIN mentor_plans p ON s.mentor_plans_id = p.id
            WHERE s.mentor_id = ?
            ORDER BY s.start_time ASC
        `, [mentorId]);

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Admin slots GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { mentor_id, plan_id, slots } = await request.json();

        if (!mentor_id || !plan_id || !slots || !Array.isArray(slots)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert slots
        const conflicts = [];
        for (const slot of slots) {
            const startStr = new Date(slot.start).toISOString().slice(0, 19).replace('T', ' ');
            const endStr = new Date(slot.end).toISOString().slice(0, 19).replace('T', ' ');

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            const [overlapRows] = await pool.execute(
                `SELECT id FROM mentor_slots 
                 WHERE mentor_id = ? 
                 AND (start_time < ? AND end_time > ?)`,
                [mentor_id, endStr, startStr]
            ) as any[];

            if (overlapRows.length > 0) {
                conflicts.push(slot);
                continue;
            }

            await pool.execute(
                "INSERT INTO mentor_slots (mentor_id, mentor_plans_id, start_time, end_time, is_booked) VALUES (?, ?, ?, ?, 0)",
                [mentor_id, plan_id, startStr, endStr]
            );
        }

        if (conflicts.length > 0 && conflicts.length === slots.length) {
            return NextResponse.json({ error: "All slots conflict with existing ones", conflicts }, { status: 409 });
        }

        return NextResponse.json({
            success: true,
            count: slots.length - conflicts.length,
            conflicts: conflicts.length
        });

    } catch (error) {
        console.error("Admin slots POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await pool.execute("DELETE FROM mentor_slots WHERE id = ?", [id]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin slots DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
