import pool from "@/lib/db";
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
                    const [rows] = await pool.execute(
                        "SELECT id, name, role, is_active FROM users WHERE email = ?",
                        [session.user.email]
                    ) as any[];

                    if (rows.length > 0) {
                        const user = rows[0];
                        (session.user as any).db_id = user.id;
                        (session.user as any).role = user.role;
                        if (user.name) {
                            session.user.name = user.name;
                        }

                        // If mentor, check verification status
                        if (user.role === 'mentor') {
                            const [mentorRows] = await pool.execute(
                                "SELECT is_verified FROM mentors WHERE user_id = ?",
                                [user.id]
                            ) as any[];
                            if (mentorRows.length > 0) {
                                (session.user as any).is_verified = mentorRows[0].is_verified;
                            }
                        }
                    }

                } catch (error) {
                    console.error("Auth session error:", error);
                }
            }
            return session;
        },
    },
};
