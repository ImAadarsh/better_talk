"use client";

import { motion } from "framer-motion";
import {
    Users,
    Stethoscope,
    CalendarCheck,
    IndianRupee,
    ArrowRight,
    TrendingUp,
    MessageSquare,
    CheckCircle2,
    Clock,
    UserPlus,
    BarChart3,
    PieChart as PieIcon,
    Activity,
    Globe
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
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { useEffect, useState } from "react";
import Link from "next/link";
import ScientificLoader from "@/components/ScientificLoader";



export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        total_users: 0,
        total_mentors: 0,
        total_revenue: 0,
        total_groups: 0,
        total_posts: 0,
        total_comments: 0,
        total_pending_mentors: 0,
        total_messages: 0,
        avg_price: 0,
        confirmed_bookings: 0,
        user_trend: 0,
        revenue_trend: 0
    });
    const [chartData, setChartData] = useState([]);
    const [distributions, setDistributions] = useState<any>({ roles: [], bookings: [] });
    const [recentMentors, setRecentMentors] = useState<any[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                if (data.stats) setStats(data.stats);
                if (data.charts) setChartData(data.charts);
                if (data.distributions) setDistributions(data.distributions);
                if (data.recentMentors) setRecentMentors(data.recentMentors);
                if (data.recentMessages) setRecentMessages(data.recentMessages);
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

            {/* Metrics Grid - 10 KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    trend={stats.user_trend}
                    color="blue"
                />
                <StatCard
                    title="Verified Mentors"
                    value={stats.total_mentors}
                    icon={CheckCircle2}
                    trend={0}
                    color="green"
                />
                <StatCard
                    title="Platform Revenue"
                    value={`₹${stats.total_revenue.toLocaleString()}`}
                    icon={IndianRupee}
                    trend={stats.revenue_trend}
                    color="amber"
                />
                <StatCard
                    title="Active Circles"
                    value={stats.total_groups}
                    icon={Globe}
                    trend={0}
                    color="purple"
                />
                <StatCard
                    title="Total Posts"
                    value={stats.total_posts}
                    icon={Activity}
                    trend={0}
                    color="blue"
                />
                <StatCard
                    title="Total Comments"
                    value={stats.total_comments}
                    icon={MessageSquare}
                    trend={0}
                    color="purple"
                />
                <StatCard
                    title="Pending Mentors"
                    value={stats.total_pending_mentors}
                    icon={Clock}
                    trend={0}
                    color="amber"
                />
                <StatCard
                    title="Customer Inquiries"
                    value={stats.total_messages}
                    icon={MessageSquare}
                    trend={0}
                    color="blue"
                />
                <StatCard
                    title="Confirmed Bookings"
                    value={stats.confirmed_bookings}
                    icon={CalendarCheck}
                    trend={0}
                    color="green"
                />
                <StatCard
                    title="Avg Plan Price"
                    value={`₹${stats.avg_price}`}
                    icon={BarChart3}
                    trend={0}
                    color="purple"
                />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth & Activity Series */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Engagement & Growth</h3>
                            <p className="text-sm text-gray-400 font-medium">Last 7 days platform activity </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Interaction</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="100%">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="100%">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="posts" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorActivity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Overview */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="revenue" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Roles Pie */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <PieIcon className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-gray-900">User Composition</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributions.roles}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributions.roles.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Status distribution */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-900">Booking Status</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributions.bookings} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={20} />
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
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {recentMentors.length > 0 ? recentMentors.map((mentor) => (
                            <div key={mentor.id} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                                    <Stethoscope className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{mentor.name}</h4>
                                    <p className="text-sm text-gray-500 truncate">{mentor.headline || "Therapist Applicant"}</p>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${mentor.is_verified === 1 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                                    }`}>
                                    {mentor.is_verified === 1 ? "Verified" : "Pending"}
                                </span>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-gray-400 text-sm font-medium">No recent applications</div>
                        )}
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
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {recentMessages.length > 0 ? recentMessages.map((msg) => (
                            <div key={msg.id} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{msg.subject || "No Subject"}</h4>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">{msg.message}</p>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                                        {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-gray-400 text-sm font-medium">No new inquiries</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
