import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function dropRedundantTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Checking for redundant 'group_comments' table...");
        
        // Check if group_comments exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'group_comments'");
        
        if (Array.isArray(tables) && tables.length > 0) {
            console.log("Removing 'group_comments' table...");
            await connection.execute("DROP TABLE group_comments");
            console.log("Table 'group_comments' dropped successfully.");
        } else {
            console.log("Table 'group_comments' does not exist. Skipping.");
        }

    } catch (error) {
        console.error("Cleanup error:", error);
    } finally {
        await connection.end();
    }
}

dropRedundantTable();
