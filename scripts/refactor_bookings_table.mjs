import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function refactorBookingsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Altering 'bookings' table...");

        // 1. Add mentor_slot_id column
        console.log("Adding mentor_slot_id...");
        // Check if column exists first to be safe, but typically we just run ALTER
        try {
            await connection.execute(`
                ALTER TABLE bookings 
                ADD COLUMN mentor_slot_id BIGINT UNSIGNED DEFAULT NULL AFTER mentor_plan_id,
                ADD INDEX idx_bookings_slot_id (mentor_slot_id),
                ADD CONSTRAINT fk_bookings_slot FOREIGN KEY (mentor_slot_id) REFERENCES mentor_slots(id) ON DELETE SET NULL ON UPDATE CASCADE
            `);
            console.log("Added mentor_slot_id successfully.");
        } catch (e) {
            console.warn("Skipping adding mentor_slot_id (might already exist):", e.message);
        }

        // 2. Remove session_start_at and session_end_at
        console.log("Dropping session timestamps...");
        try {
            await connection.execute(`
                ALTER TABLE bookings 
                DROP COLUMN session_start_at,
                DROP COLUMN session_end_at
            `);
            console.log("Dropped session_start_at/end_at successfully.");
        } catch (e) {
            console.warn("Skipping dropping columns (might not exist):", e.message);
        }

        console.log("'bookings' table refactored successfully.");
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await connection.end();
    }
}

refactorBookingsTable();
