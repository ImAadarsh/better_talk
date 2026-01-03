import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const seedData = [
    {
        author_name: "Aarav Patel",
        author_role: "Software Engineer",
        title: "Found peace amidst chaos",
        content: "BetterTalk has been a lifesaver for managing my work stress. The mentors are incredibly understanding and the community is so supportive.",
        rating: 5
    },
    {
        author_name: "Diya Sharma",
        author_role: "Student",
        title: "A safe space to share",
        content: "I was hesitant at first, but the anonymity helped me open up about my anxiety. It feels like a weight has been lifted off my shoulders.",
        rating: 5
    },
    {
        author_name: "Arjun Singh",
        author_role: "Marketing Specialist",
        title: "Real connections, real help",
        content: "The verified mentors actually listen. I found a great therapist here who helped me navigate a difficult breakup.",
        rating: 4
    },
    {
        author_name: "Ananya Gupta",
        author_role: "Graphic Designer",
        title: "Better mental clarity",
        content: "Using the journaling tools and talking to others has improved my focus and overall mental well-being significantly.",
        rating: 5
    },
    {
        author_name: "Vihaan Kumar",
        author_role: "Entrepreneur",
        title: "Highly recommended!",
        content: "Starting a business is stressful, but having a mentor to talk to once a week keeps me grounded. Essential for any founder.",
        rating: 5
    },
    {
        author_name: "Ishita Reddy",
        author_role: "HR Professional",
        title: "Empathy at its best",
        content: "I deal with people problems all day, but sometimes I need someone to listen to me. BetterTalk provided that space.",
        rating: 4
    },
    {
        author_name: "Rohan Verma",
        author_role: "College Student",
        title: "Helped with exam stress",
        content: "The exam season was overwhelming, but the support groups here helped me realize I wasn't alone. Great platform.",
        rating: 5
    },
    {
        author_name: "Meera Iyer",
        author_role: "Homemaker",
        title: "Finally feeling heard",
        content: "It's easy to feel isolated at home. Connecting with other women in the support circles has been empowering.",
        rating: 5
    },
    {
        author_name: "Kabir Das",
        author_role: "Musician",
        title: "Creative block lifted",
        content: "My mental health was affecting my music. Therapy sessions here helped me unlock my creativity again.",
        rating: 4
    },
    {
        author_name: "Sanya Malhotra",
        author_role: "Architect",
        title: "Professional and private",
        content: "I love how secure and private the platform is. I can talk freely without worrying about my data.",
        rating: 5
    }
];

async function seedStories() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("Seeding 'stories' table...");

        // Clear existing data (optional, but good for clean seed)
        // await connection.execute("TRUNCATE TABLE stories"); 

        for (const story of seedData) {
            await connection.execute(
                "INSERT INTO stories (author_name, author_role, title, content, rating, is_active) VALUES (?, ?, ?, ?, ?, 1)",
                [story.author_name, story.author_role, story.title, story.content, story.rating]
            );
        }

        console.log(`Successfully inserted ${seedData.length} stories.`);
    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await connection.end();
    }
}

seedStories();
