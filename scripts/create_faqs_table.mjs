import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function createFaqsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Creating faqs table...');
        
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS faqs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                priority INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('faqs table created successfully.');

        // Seed some initial data if empty
        const [rows] = await connection.execute('SELECT count(*) as count FROM faqs');
        // @ts-ignore
        if (rows[0].count === 0) {
            console.log('Seeding initial FAQs...');
            const initialFaqs = [
                {
                    q: "Is BetterTalk really anonymous?",
                    a: "Yes! You choose an anonymous username during onboarding, and your personal details like email and phone are never shared publicly.",
                    p: 10
                },
                {
                    q: "How do I become a verified Therapist?",
                    a: "You can apply through our therapist portal. We review certifications and experience before granting the verified badge.",
                    p: 9
                },
                {
                    q: "Is the platform free to use?",
                    a: "Joining groups and community discussions is completely free. 1-on-1 mentorship sessions are paid bookings.",
                    p: 8
                },
                {
                    q: "Can I delete my account?",
                    a: "Yes, you can request account deletion at any time from your profile settings.",
                    p: 7
                },
                {
                    q: "How do I report inappropriate content?",
                    a: "Use the report button on any post or comment. Our moderation team reviews all reports within 24 hours.",
                    p: 6
                }
            ];

            for (const faq of initialFaqs) {
                await connection.execute(
                    'INSERT INTO faqs (question, answer, priority) VALUES (?, ?, ?)',
                    [faq.q, faq.a, faq.p]
                );
            }
            console.log('Initial FAQs seeded.');
        }

    } catch (error) {
        console.error('Error creating faqs table:', error);
    } finally {
        await connection.end();
    }
}

createFaqsTable();
