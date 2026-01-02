
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("Connected to database.");

        try {
            await connection.execute("ALTER TABLE mentor_slots ADD COLUMN client_id INT NULL DEFAULT NULL AFTER mentor_id;");
            console.log("Schema updated successfully.");
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log("Column client_id already exists.");
            } else {
                throw error;
            }
        }

        await connection.end();
    } catch (error) {
        console.error("Error updating schema:", error);
    }
}

updateSchema();
