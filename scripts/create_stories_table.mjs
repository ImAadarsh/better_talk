import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function createStoriesTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Creating 'stories' table...");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS stories (
                id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                author_name           VARCHAR(191) NOT NULL,
                author_role           VARCHAR(100) DEFAULT 'User',
                title                 VARCHAR(191) DEFAULT NULL,
                content               TEXT NOT NULL,
                rating                INT DEFAULT 5,
                is_active             TINYINT(1) NOT NULL DEFAULT 1,
                created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log("Table 'stories' created successfully.");
    } catch (error) {
        console.error("Migration error:", error);
    } finally {
        await connection.end();
    }
}

createStoriesTable();
