import mysql from "mysql2/promise";
import { readFileSync } from "fs";

try {
    const envFile = readFileSync(".env.local", "utf8");
    envFile.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (key && value) process.env[key.trim()] = value.trim();
    });
} catch (e) {}

async function setup() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("Creating notification_logs table if not exists...");
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notification_logs (
              id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              user_id               BIGINT UNSIGNED NOT NULL,
              type                  VARCHAR(50) NOT NULL,
              reference_type        VARCHAR(50) DEFAULT NULL,
              reference_id          BIGINT UNSIGNED DEFAULT NULL,
              sent_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              status                ENUM('success','failed') NOT NULL DEFAULT 'success',
              error_message         VARCHAR(255) DEFAULT NULL,
            
              INDEX idx_notification_logs_user_id (user_id),
              INDEX idx_notification_logs_type (type),
              CONSTRAINT fk_notification_logs_user
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("Table verified/created.");

    } catch (error) {
        console.error("Setup script error:", error);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

setup();
