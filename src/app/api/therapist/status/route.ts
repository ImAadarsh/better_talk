import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Check if user is a mentor
        const [mentors] = await connection.execute(
            `SELECT is_verified FROM mentors 
             WHERE user_id = (SELECT id FROM users WHERE email = ?)`,
            [session.user.email]
        ) as any[];

        await connection.end();

        if (mentors.length > 0) {
            return NextResponse.json({
                applied: true,
                isVerified: mentors[0].is_verified === 1
            });
        }

        return NextResponse.json({ applied: false, isVerified: false });

    } catch (error) {
        console.error("Therapist status error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
