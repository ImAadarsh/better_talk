import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const planId = params.id;
        const { price_in_inr, session_duration_min, chat_window_days, is_active } = await request.json();

        await pool.execute(
            "UPDATE mentor_plans SET price_in_inr = ?, session_duration_min = ?, chat_window_days = ?, is_active = ? WHERE id = ?",
            [price_in_inr, session_duration_min, chat_window_days, is_active, planId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin plans PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const planId = params.id;
        await pool.execute("DELETE FROM mentor_plans WHERE id = ?", [planId]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Admin plans DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
