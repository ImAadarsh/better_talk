"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    color?: "blue" | "green" | "purple" | "amber";
}

export default function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        green: "bg-green-50 text-green-600 ring-green-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100",
        amber: "bg-amber-50 text-amber-500 ring-amber-100",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ring-4 ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
            </div>
        </motion.div>
    );
}
