
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Revenue Per Therapist
        const [revenueData] = await pool.execute(`
            SELECT 
                m.id, 
                u.name as therapist_name, 
                u.email as therapist_email,
                SUM(b.amount_paid_in_inr) as total_revenue, 
                COUNT(b.id) as total_sessions
            FROM bookings b
            JOIN mentors m ON b.mentor_id = m.id
            JOIN users u ON m.user_id = u.id
            WHERE b.status = 'confirmed'
            GROUP BY m.id, u.name, u.email
            ORDER BY total_revenue DESC
        `);

        // 2. Top 50 Paying Users
        const [topUsers] = await pool.execute(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                SUM(b.amount_paid_in_inr) as total_spent,
                COUNT(b.id) as sessions_booked
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.status = 'confirmed'
            GROUP BY u.id, u.name, u.email
            ORDER BY total_spent DESC
            LIMIT 50
        `);

        // 3. Trending Communities (Groups) by Engagement (Posts + Comments)
        // Using subqueries for cleaner counts avoids cartesian product issues with multiple joins
        const [trendingGroups] = await pool.execute(`
            SELECT 
                g.id, 
                g.name, 
                (SELECT COUNT(*) FROM group_posts gp WHERE gp.group_id = g.id AND gp.is_deleted = 0) as post_count,
                (SELECT COUNT(*) FROM group_post_comments gpc 
                 JOIN group_posts gp ON gpc.post_id = gp.id 
                 WHERE gp.group_id = g.id AND gpc.is_deleted = 0) as comment_count
            FROM groups g
            WHERE g.is_active = 1
            ORDER BY (post_count + comment_count) DESC
            LIMIT 20
        `);

        return NextResponse.json({
            revenueByTherapist: revenueData,
            topUsers: topUsers,
            trendingGroups: trendingGroups
        });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
