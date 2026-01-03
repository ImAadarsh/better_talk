import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function checkGroups() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Checking groups...");
        const [rows] = await connection.execute("SELECT id, name, slug FROM groups ORDER BY id DESC");
        console.table(rows);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

checkGroups();
