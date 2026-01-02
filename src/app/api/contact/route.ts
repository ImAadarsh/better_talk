import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await pool.execute(
            "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
            [name, email, subject || null, message]
        );

        return NextResponse.json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
