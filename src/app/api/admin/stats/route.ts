import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Helper to get total for a period
        const getCount = async (table: string, dateCol: string, daysAgoStart: number, daysAgoEnd: number, where = '1=1') => {
            const [[{ count }]] = await pool.execute(`
                SELECT COUNT(*) as count FROM \`${table}\` 
                WHERE ${where} AND ${dateCol} >= CURDATE() - INTERVAL ? DAY 
                AND ${dateCol} < CURDATE() - INTERVAL ? DAY
            `, [daysAgoStart, daysAgoEnd]) as any;
            return count;
        };

        const getSum = async (table: string, sumCol: string, dateCol: string, daysAgoStart: number, daysAgoEnd: number, where = 'status="confirmed"') => {
            const [[{ total }]] = await pool.execute(`
                SELECT SUM(${sumCol}) as total FROM \`${table}\` 
                WHERE ${where} AND ${dateCol} >= CURDATE() - INTERVAL ? DAY 
                AND ${dateCol} < CURDATE() - INTERVAL ? DAY
            `, [daysAgoStart, daysAgoEnd]) as any;
            return total || 0;
        };

        // 1. Core KPIs with Growth %
        const currUsers = await getCount('users', 'created_at', 7, 0);
        const prevUsers = await getCount('users', 'created_at', 14, 7);
        const userTrend = prevUsers === 0 ? 100 : Math.round(((currUsers - prevUsers) / prevUsers) * 100);

        const currRevenue = await getSum('bookings', 'amount_paid_in_inr', 'created_at', 7, 0);
        const prevRevenue = await getSum('bookings', 'amount_paid_in_inr', 'created_at', 14, 7);
        const revenueTrend = prevRevenue === 0 ? 100 : Math.round(((currRevenue - prevRevenue) / prevRevenue) * 100);

        // 2. Aggregate Data for Grid
        const [[{ total_users }]] = await pool.execute("SELECT COUNT(*) as total_users FROM users") as any;
        const [[{ total_mentors }]] = await pool.execute("SELECT COUNT(*) as total_mentors FROM mentors WHERE is_verified = 1") as any;
        const [[{ total_pending_mentors }]] = await pool.execute("SELECT COUNT(*) as total_count FROM mentors WHERE is_verified = 0") as any;
        const [[{ total_revenue }]] = await pool.execute("SELECT SUM(amount_paid_in_inr) as total_revenue FROM bookings WHERE status = 'confirmed'") as any;
        const [[{ total_groups }]] = await pool.execute("SELECT COUNT(*) as total_groups FROM \`groups\` WHERE is_active = 1") as any;
        const [[{ total_posts }]] = await pool.execute("SELECT COUNT(*) as total_posts FROM group_posts WHERE is_deleted = 0") as any;
        const [[{ total_comments }]] = await pool.execute("SELECT COUNT(*) as total_comments FROM group_post_comments WHERE is_deleted = 0") as any;
        const [[{ total_messages }]] = await pool.execute("SELECT COUNT(*) as total_messages FROM contact_messages") as any;
        const [[{ avg_price }]] = await pool.execute("SELECT AVG(price_in_inr) as avg_price FROM mentor_plans WHERE is_active = 1") as any;
        const [[{ confirmed_bookings }]] = await pool.execute("SELECT COUNT(*) as total FROM bookings WHERE status = 'confirmed'") as any;

        // 3. User Role Distribution (for Pie/Donut)
        const [roleDist] = await pool.execute("SELECT role as name, COUNT(*) as value FROM users GROUP BY role") as any[];

        // 4. Booking Status Distribution
        const [statusDist] = await pool.execute("SELECT status as name, COUNT(*) as value FROM bookings GROUP BY status") as any[];

        // 5. Daily Growth (Last 7 days) with multi-series
        const [growthRows] = await pool.execute(`
            SELECT 
                DATE_FORMAT(dates.date, '%a') as name,
                COALESCE(u.count, 0) as users,
                COALESCE(b.revenue, 0) as revenue,
                COALESCE(p.count, 0) as posts,
                COALESCE(c.count, 0) as comments
            FROM (
                SELECT CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY as date
                FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as a
                CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as b
            ) dates
            LEFT JOIN (SELECT DATE(created_at) as date, COUNT(*) as count FROM users GROUP BY DATE(created_at)) u ON dates.date = u.date
            LEFT JOIN (SELECT DATE(created_at) as date, SUM(amount_paid_in_inr) as revenue FROM bookings WHERE status = 'confirmed' GROUP BY DATE(created_at)) b ON dates.date = b.date
            LEFT JOIN (SELECT DATE(created_at) as date, COUNT(*) as count FROM group_posts WHERE is_deleted = 0 GROUP BY DATE(created_at)) p ON dates.date = p.date
            LEFT JOIN (SELECT DATE(created_at) as date, COUNT(*) as count FROM group_post_comments WHERE is_deleted = 0 GROUP BY DATE(created_at)) c ON dates.date = c.date
            WHERE dates.date >= CURDATE() - INTERVAL 6 DAY
            ORDER BY dates.date ASC
        `) as any[];

        // 6. Recent Items
        const [recentMentors] = await pool.execute(`
            SELECT m.*, u.name, u.email 
            FROM mentors m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
            LIMIT 5
        `);

        const [recentMessages] = await pool.execute(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        return NextResponse.json({
            stats: {
                total_users,
                total_mentors,
                total_revenue: total_revenue || 0,
                total_groups,
                total_posts,
                total_comments,
                total_pending_mentors,
                total_messages,
                avg_price: Math.round(avg_price || 0),
                confirmed_bookings,
                user_trend: userTrend,
                revenue_trend: revenueTrend
            },
            charts: growthRows,
            distributions: {
                roles: roleDist,
                bookings: statusDist
            },
            recentMentors,
            recentMessages
        });

    } catch (error) {
        console.error("Admin stats API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
