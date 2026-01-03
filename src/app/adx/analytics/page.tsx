"use client";

import { useEffect, useState } from "react";
import ScientificLoader from "@/components/ScientificLoader";
import { BarChart3, TrendingUp, Users, MessageCircle, DollarSign, Award } from "lucide-react";

interface TherapistRevenue {
    id: number;
    therapist_name: string;
    therapist_email: string;
    total_revenue: number;
    total_sessions: number;
}

interface TopUser {
    id: number;
    name: string;
    email: string;
    total_spent: number;
    sessions_booked: number;
}

interface TrendingGroup {
    id: number;
    name: string;
    post_count: number;
    comment_count: number;
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        revenueByTherapist: TherapistRevenue[];
        topUsers: TopUser[];
        trendingGroups: TrendingGroup[];
    } | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/analytics");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><ScientificLoader /></div>;
    if (!data) return <div className="p-8 text-center text-gray-500">Failed to load data</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
                <p className="text-gray-600">Key metrics on revenue, user spending, and community engagement.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Revenue Per Therapist */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Revenue by Therapist
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Total earnings generated per therapist</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Therapist</th>
                                    <th className="px-6 py-3 text-center">Sessions</th>
                                    <th className="px-6 py-3 text-right">Revenue (INR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.revenueByTherapist.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                                                {item.therapist_name}
                                            </div>
                                            <div className="text-xs text-gray-500 ml-6">{item.therapist_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                                            {item.total_sessions}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-green-700">₹{Number(item.total_revenue).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Top Paying Users */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Top 50 Spenders
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Highest paying users by total transaction volume</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3 text-center">Bookings</th>
                                    <th className="px-6 py-3 text-right">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.topUsers.map((user, idx) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-gray-500 ml-6">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                                            {user.sessions_booked}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900">₹{Number(user.total_spent).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Trending Communities */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Trending Communities
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Most active groups by total posts and comments</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Community Group</th>
                                    <th className="px-6 py-3 text-center">Posts</th>
                                    <th className="px-6 py-3 text-center">Comments</th>
                                    <th className="px-6 py-3 text-center">Engagement Score</th>
                                    <th className="px-6 py-3 text-right">Activity Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.trendingGroups.map((group, idx) => {
                                    const total = Number(group.post_count) + Number(group.comment_count);
                                    return (
                                        <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 flex items-center gap-3">
                                                    <span className="text-2xl font-black text-gray-200">#{idx + 1}</span>
                                                    {group.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                                    <FileText className="w-3 h-3" />
                                                    {group.post_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {group.comment_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-lg font-bold text-gray-900">{total}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    {total > 100 ? (
                                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" /> Very High
                                                        </span>
                                                    ) : total > 50 ? (
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">High</span>
                                                    ) : total > 20 ? (
                                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Moderate</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Low</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper icon
function FileText({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    )
}
