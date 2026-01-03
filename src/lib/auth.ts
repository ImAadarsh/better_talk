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
        async signIn({ user, account, profile }) {
            try {
                // Check if user exists
                const [rows] = await pool.execute(
                    "SELECT id FROM users WHERE email = ?",
                    [user.email]
                ) as any[];

                if (rows.length > 0) {
                    // User exists - allow sign in (will go to callbackUrl which is /sessions typically)
                    return true;
                } else {
                    // New User - Create placeholder and redirect to onboarding
                    await pool.execute(
                        "INSERT INTO users (email, name, image, google_id, role, is_active) VALUES (?, ?, ?, ?, 'user', 1)",
                        [user.email, user.name || 'New User', user.image, user.id] // user.id from next-auth is the sub/google_id
                    );
                    return "/onboarding";
                }
            } catch (error) {
                console.error("SignIn callback error:", error);
                return true; // Fallback
            }
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                try {
                    const [rows] = await pool.execute(
                        "SELECT role FROM users WHERE email = ?",
                        [user.email]
                    ) as any[];

                    if (rows.length > 0) {
                        (token as any).role = rows[0].role;
                    }
                } catch (error) {
                    console.error("JWT role fetch error:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Pass the sub (google id) to the client
                (session.user as any).id = token.sub;
                (session.user as any).role = (token as any).role;

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
