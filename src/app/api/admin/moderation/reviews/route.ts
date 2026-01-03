
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// PATCH: Approve or Reject Review (Admin Only)
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        await pool.execute(`
            UPDATE reviews SET status = ? WHERE id = ?
        `, [status, id]);

        return NextResponse.json({ message: `Review ${status} successfully` });

    } catch (error) {
        console.error("Moderate Review Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
