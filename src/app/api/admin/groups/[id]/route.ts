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

        const groupId = params.id;
        const { name, slug, description, is_active } = await request.json();

        await pool.execute(
            "UPDATE \`groups\` SET name = ?, slug = ?, description = ?, is_active = ? WHERE id = ?",
            [name, slug, description, is_active ? 1 : 0, groupId]
        );

        return NextResponse.json({ success: true, message: "Community updated" });

    } catch (error) {
        console.error("Admin group PATCH error:", error);
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

        const groupId = params.id;
        await pool.execute("DELETE FROM \`groups\` WHERE id = ?", [groupId]);

        return NextResponse.json({ success: true, message: "Community deleted" });

    } catch (error) {
        console.error("Admin group DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
