import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        if (!username || username.length < 3) {
            return NextResponse.json({ available: false, error: "Username too short" });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(
            "SELECT id FROM users WHERE anonymous_username = ?",
            [username]
        );

        await connection.end();

        if (Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ available: false });
        } else {
            return NextResponse.json({ available: true });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
