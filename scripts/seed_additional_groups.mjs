import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const groupsToSeed = [
    {
        name: "Anxiety Support",
        description: "A safe space to discuss anxiety and share coping mechanisms.",
        slug: "anxiety-support"
    },
    {
        name: "Heartbreak Healing",
        description: "Supporting each other through relationship endings and new beginnings.",
        slug: "heartbreak-healing"
    },
    {
        name: "Mindfulness & Meditation",
        description: "Sharing techniques for staying present and finding inner peace.",
        slug: "mindfulness-meditation"
    },
    {
        name: "Career Growth",
        description: "Discussing workplace challenges, ambitions, and professional development.",
        slug: "career-growth"
    },
    {
        name: "Sleep & Insomnia",
        description: "Tips and support for better rest and overcoming sleep struggles.",
        slug: "sleep-insomnia"
    },
    {
        name: "Parenting Circle",
        description: "A supportive space for parents to share challenges and advice.",
        slug: "parenting-circle"
    },
    {
        name: "Grief Support",
        description: "Healing together after the loss of a loved one.",
        slug: "grief-support"
    },
    {
        name: "Work-Life Balance",
        description: "Finding harmony between professional goals and personal well-being.",
        slug: "work-life-balance"
    }
];

async function seedGroups() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Seeding additional groups...");

        // 1. Get a valid user ID to be the creator (e.g., the first admin)
        const [users] = await connection.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        let creatorId;
        
        if (users.length > 0) {
            creatorId = users[0].id;
        } else {
             // Fallback to any user if no admin
             const [anyUser] = await connection.execute("SELECT id FROM users LIMIT 1");
             if (anyUser.length > 0) {
                 creatorId = anyUser[0].id;
             } else {
                 console.error("No users found to set as creator. Please create a user first.");
                 process.exit(1);
             }
        }

        console.log(`Using User ID ${creatorId} as creator.`);

        for (const group of groupsToSeed) {
            // Check if exists
            const [existing] = await connection.execute("SELECT id FROM groups WHERE slug = ?", [group.slug]);
            
            if (existing.length === 0) {
                await connection.execute(
                    "INSERT INTO groups (name, description, slug, created_by, is_active) VALUES (?, ?, ?, ?, 1)",
                    [group.name, group.description, group.slug, creatorId]
                );
                console.log(`Included group: ${group.name}`);
            } else {
                console.log(`Group already exists: ${group.name}`);
            }
        }
        
        console.log("Seeding completed.");

    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await connection.end();
    }
}

seedGroups();
