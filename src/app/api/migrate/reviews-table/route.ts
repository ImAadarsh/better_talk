
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS reviews (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                booking_id BIGINT UNSIGNED NOT NULL,
                user_id BIGINT UNSIGNED NOT NULL,
                mentor_id BIGINT UNSIGNED NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                UNIQUE KEY uq_reviews_booking (booking_id),
                INDEX idx_reviews_user (user_id),
                INDEX idx_reviews_mentor (mentor_id),
                INDEX idx_reviews_status (status),

                CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_reviews_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await pool.execute(query);

        return NextResponse.json({ message: "Reviews table created successfully" });

    } catch (error) {
        console.error("Migration Error:", error);
        return NextResponse.json({ error: "Migration failed", details: error }, { status: 500 });
    }
}
