
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get User ID and join with mentors
        const [rows] = await pool.execute(
            `SELECT m.id, m.user_id, m.designation, m.headlines, m.patients_treated, m.is_verified, 
                    m.bio, m.contact_number, m.expertise_tags, m.languages, m.experience_years,
                    u.name, u.email, u.image
             FROM users u
             JOIN mentors m ON u.id = m.user_id
             WHERE u.email = ?`,
            [session.user?.email]
        ) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            designation,
            headlines,
            patients_treated,
            bio,
            contact_number,
            expertise_tags,
            languages,
            experience_years,
            image
        } = await req.json();

        // Update mentors table based on user email (via join logic or subquery)
        // Easiest is to get user ID first
        const [userRows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [session.user?.email]
        ) as any[];


        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = userRows[0].id;

        await pool.execute(
            `UPDATE mentors 
             SET designation = ?, headlines = ?, patients_treated = ?, bio = ?, contact_number = ?, expertise_tags = ?, languages = ?, experience_years = ?
             WHERE user_id = ?`,
            [designation, headlines, patients_treated, bio, contact_number, expertise_tags, languages, experience_years, userId]
        );

        if (image) {
            await pool.execute(
                `UPDATE users SET image = ? WHERE id = ?`,
                [image, userId]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
