import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fullName, contactNumber, designation, patientsTreated, bio } = await req.json();
        console.log("Therapist Apply Payload:", { fullName, contactNumber, designation, patientsTreated, bio, email: session.user.email, image: session.user.image });

        if (!contactNumber || !designation || !patientsTreated || !bio) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Check if user exists
        const [users] = await pool.execute(
            "SELECT id, role FROM users WHERE email = ?",
            [session.user.email]
        ) as any[];

        let userId;

        if (users.length === 0) {
            // Create user
            // We need google_id. session.user.id is mapped from token.sub in auth.ts
            const googleId = (session.user as any).id;

            // Generate a random username or use name
            const randomSuffix = Math.floor(Math.random() * 10000);
            const username = `therapist_${randomSuffix}`; // Placeholder

            const [insertResult] = await pool.execute(
                `INSERT INTO users (google_id, name, email, image, phone_number, age, anonymous_username, role, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'mentor', 1)`,
                [googleId, fullName, session.user.email, session.user.image, contactNumber, 0, username]
            ) as any;

            userId = insertResult.insertId;
            console.log("Created new therapist user:", userId);
        } else {
            userId = users[0].id;

            // Check if existing user is trying to apply
            // If they are a 'user' role, block them. They must not have an existing user account if we want strict separation
            // OR we allow it but they lose their user access? The requirement says "if already a user exist as a user then will show error"

            if (users[0].role === 'user') {
                return NextResponse.json({
                    error: "You are already registered as a User. You cannot apply as a Therapist with this account."
                }, { status: 403 });
            }

            // Update existing user (if they were already a mentor or admin, maybe?)
            await pool.execute(
                "UPDATE users SET name = ?, image = ?, phone_number = ? WHERE id = ?",
                [fullName, session.user.image, contactNumber, userId]
            );
            console.log("Updated existing user:", userId);
        }

        // 2. Check and Upsert Mentor
        const [existingMentors] = await pool.execute(
            "SELECT id FROM mentors WHERE user_id = ?",
            [userId]
        ) as any[];

        if (existingMentors.length > 0) {
            // Update existing application
            await pool.execute(
                `UPDATE mentors 
                 SET designation = ?, patients_treated = ?, bio = ?, contact_number = ?, is_verified = 0 
                 WHERE id = ?`,
                [designation, patientsTreated, bio, contactNumber, existingMentors[0].id]
            );
        } else {
            // Insert new mentor record
            await pool.execute(
                `INSERT INTO mentors (user_id, designation, patients_treated, bio, contact_number, is_verified)
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [userId, designation, patientsTreated, bio, contactNumber]
            );
        }

        // 3. Update user role to 'mentor' (even if unverified, or keep as user until verified?) 
        // 3. Ensure role is mentor
        await pool.execute(
            "UPDATE users SET role = 'mentor' WHERE id = ?",
            [userId]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Therapist app error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
