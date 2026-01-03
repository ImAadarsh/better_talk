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
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookingId = params.id;
        const { status } = await req.json();

        if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Update booking status
        await pool.execute(
            "UPDATE bookings SET session_status = ? WHERE id = ?",
            [status, bookingId]
        );

        return NextResponse.json({ success: true, message: "Status updated successfully" });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
