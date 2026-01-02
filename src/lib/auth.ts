import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Pass the sub (google id) to the client
                (session.user as any).id = token.sub;

                try {
                    const mysql = require('mysql2/promise');
                    const connection = await mysql.createConnection({
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME,
                    });

                    const [rows] = await connection.execute(
                        "SELECT id, role, is_active FROM users WHERE email = ?",
                        [session.user.email]
                    );

                    if (rows.length > 0) {
                        const user = rows[0];
                        (session.user as any).db_id = user.id;
                        (session.user as any).role = user.role;

                        // If mentor, check verification status
                        if (user.role === 'mentor') {
                            const [mentorRows] = await connection.execute(
                                "SELECT is_verified FROM mentors WHERE user_id = ?",
                                [user.id]
                            );
                            if (mentorRows.length > 0) {
                                (session.user as any).is_verified = mentorRows[0].is_verified;
                            }
                        }
                    }
                    await connection.end();

                } catch (error) {
                    console.error("Auth session error:", error);
                }
            }
            return session;
        },
    },
};
