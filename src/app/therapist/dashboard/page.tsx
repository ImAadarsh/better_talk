"use client";

import { useEffect, useState } from "react";
import TherapistLayout from "@/components/TherapistLayout";
import { useSession } from "next-auth/react";
import { Loader2, Users, Calendar, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface DashboardStats {
    totalPatients: number;
    upcomingSessionsCount: number;
    nextSession: {
        start_time: string;
        client_name: string;
    } | null;
}

export default function TherapistDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/therapist/stats"); // We need to create this API
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        }
        if (session?.user) {
            fetchStats();
        }
    }, [session]);

    return (
        <TherapistLayout>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {session?.user?.name}
                    </h1>
                    <p className="text-gray-500">Here&apos;s what&apos;s happening today.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stats Card 1 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats?.totalPatients || 0}</h3>
                            </div>
                        </div>

                        {/* Stats Card 2 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats?.upcomingSessionsCount || 0}</h3>
                            </div>
                        </div>

                        {/* Stats Card 3 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                <h3 className="text-2xl font-bold text-gray-900">100%</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Next Session Widget */}
                {stats?.nextSession && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 mb-8 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-blue-100 mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium uppercase tracking-wide text-xs">Up Next</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">Session with {stats.nextSession.client_name}</h3>
                                <p className="text-blue-100 text-lg">
                                    {format(parseISO(stats.nextSession.start_time), "EEEE, MMMM d 'at' h:mm a")}
                                </p>
                            </div>
                            <Link
                                href="/therapist/sessions"
                                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
                            >
                                Join Session
                            </Link>
                        </div>
                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Placeholder for Schedule Widget or Recent Activity */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                        <p>Schedule Widget Placeholder</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                        <p>Recent Activity Placeholder</p>
                    </div>
                </div>
            </div>
        </TherapistLayout>
    );
}
