"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface Column {
    key: string;
    label: string;
    render?: (val: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    title: string;
    actions?: (row: any) => React.ReactNode;
}

export default function DataTable({ columns, data, title, actions }: DataTableProps) {
    const [search, setSearch] = useState("");

    const filteredData = Array.isArray(data)
        ? data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
        )
        : [];


    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search records..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm text-gray-900"
                        />
                    </div>
                    <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#FBFCFE] border-b border-gray-50/50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {col.label}
                                </th>
                            ))}
                            {actions && <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredData.map((row, idx) => (
                            <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx}
                                className="group hover:bg-gray-50 transition-all"
                            >
                                {columns.map(col => (
                                    <td key={col.key} className="px-8 py-5 text-sm">
                                        {col.render ? col.render(row[col.key], row) : (
                                            <span className="text-gray-700 font-medium">{row[col.key]}</span>
                                        )}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-8 py-4 text-right">
                                        {actions(row)}
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-8 bg-[#FBFCFE] border-t border-gray-50 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                    Showing <span className="text-gray-900 font-bold">{filteredData.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-50 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-900 hover:bg-gray-50 shadow-sm transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
