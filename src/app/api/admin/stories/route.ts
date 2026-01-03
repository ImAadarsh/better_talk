import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [rows] = await pool.execute("SELECT * FROM stories ORDER BY created_at DESC");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Stories GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { author_name, author_role, title, content, rating, is_active } = body;

        await pool.execute(
            "INSERT INTO stories (author_name, author_role, title, content, rating, is_active) VALUES (?, ?, ?, ?, ?, ?)",
            [author_name, author_role || 'User', title, content, rating || 5, is_active ? 1 : 0]
        );

        return NextResponse.json({ success: true, message: "Story created" });
    } catch (error) {
        console.error("Stories POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
        const values = Object.values(updates);

        if (fields.length > 0) {
            await pool.execute(`UPDATE stories SET ${fields} WHERE id = ?`, [...values, id]);
        }

        return NextResponse.json({ success: true, message: "Story updated" });
    } catch (error) {
        console.error("Stories PATCH error:", error);
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

        await pool.execute("DELETE FROM stories WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: "Story deleted" });
    } catch (error) {
        console.error("Stories DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
