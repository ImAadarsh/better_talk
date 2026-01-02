"use client";

import { motion } from "framer-motion";
import {
    Users,
    Stethoscope,
    CalendarCheck,
    IndianRupee,
    ArrowRight,
    TrendingUp,
    MessageSquare
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { useEffect, useState } from "react";
import Link from "next/link";
import ScientificLoader from "@/components/ScientificLoader";



export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        total_users: 0,
        total_mentors: 0,
        total_bookings: 0,
        total_revenue: 0
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                if (data.stats) setStats(data.stats);
                if (data.charts) setChartData(data.charts);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <ScientificLoader />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse mt-4">Generating Analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview Dashboard</h1>
                    <p className="text-gray-500 font-medium">Monitoring platform health and growth metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10">
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    trend={12}
                    color="blue"
                />
                <StatCard
                    title="Verified Therapists"
                    value={stats.total_mentors}
                    icon={Stethoscope}
                    trend={5}
                    color="purple"
                />
                <StatCard
                    title="Active Bookings"
                    value={stats.total_bookings}
                    icon={CalendarCheck}
                    trend={-2}
                    color="green"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${stats.total_revenue.toLocaleString()}`}
                    icon={IndianRupee}
                    trend={24}
                    color="amber"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Growth */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">User Growth Trend</h3>
                            <p className="text-sm text-gray-400 font-medium">Last 7 days registration activity</p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                            <TrendingUp className="w-4 h-4" />
                            +18% this week
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="100%">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Overview */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Breakdown</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity & Pending Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Items */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                        <Link href="/adx/therapists" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                                    <Stethoscope className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">Dr. Sarah Johnson</h4>
                                    <p className="text-sm text-gray-500">Clinical Psychologist • Applied 2h ago</p>
                                </div>
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    Pending
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Messages */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">New Inquiries</h3>
                        <Link href="/adx/messages" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                            Open Inbox <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">Support Request #120{i}</h4>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">I need help with rescheduling my session with Dr...</p>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <p className="text-xs font-bold text-gray-400">14:20 PM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
