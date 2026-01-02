import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(
            "SELECT id, anonymous_username FROM users WHERE email = ?",
            [email]
        );

        await connection.end();

        if (Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ exists: true, user: rows[0] });
        } else {
            return NextResponse.json({ exists: false });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
