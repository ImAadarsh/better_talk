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

        // 1. Get counts from DB
        const [[{ total_users }]] = await pool.execute("SELECT COUNT(*) as total_users FROM users") as any;
        const [[{ total_mentors }]] = await pool.execute("SELECT COUNT(*) as total_mentors FROM mentors WHERE is_verified = 1") as any;
        const [[{ total_bookings }]] = await pool.execute("SELECT COUNT(*) as total_bookings FROM bookings WHERE status = 'confirmed'") as any;
        const [[{ total_revenue }]] = await pool.execute("SELECT SUM(amount_paid_in_inr) as total_revenue FROM bookings WHERE status = 'confirmed'") as any;

        // 2. Mock daily growth for charts (or fetch from DB if timestamps allow)
        const daily_growth = [
            { name: "Mon", users: 5, revenue: 1500 },
            { name: "Tue", users: 12, revenue: 3000 },
            { name: "Wed", users: 8, revenue: 4500 },
            { name: "Thu", users: 15, revenue: 2000 },
            { name: "Fri", users: 20, revenue: 6000 },
            { name: "Sat", users: 10, revenue: 2500 },
            { name: "Sun", users: 18, revenue: 5000 },
        ];

        return NextResponse.json({
            stats: {
                total_users,
                total_mentors,
                total_bookings,
                total_revenue: total_revenue || 0
            },
            charts: daily_growth
        });

    } catch (error) {
        console.error("Admin stats API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
