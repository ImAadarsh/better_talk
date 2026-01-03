"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterOption {
    value: any;
    label: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}

export interface Column {
    key: string;
    label: string;
    render?: (val: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    title: string;
    actions?: (row: any) => React.ReactNode;
    filters?: FilterConfig[];
    loading?: boolean;
    searchPlaceholder?: string;
}

export default function DataTable({ columns, data, title, actions, filters, loading, searchPlaceholder }: DataTableProps) {
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const toggleFilter = (key: string, value: any) => {
        setActiveFilters(prev => {
            const next = { ...prev };
            if (next[key] === value) {
                delete next[key];
            } else {
                next[key] = value;
            }
            return next;
        });
    };

    const clearFilters = () => {
        setActiveFilters({});
        setSearch("");
    };

    const filteredData = Array.isArray(data)
        ? data.filter(row => {
            // 1. Check Search
            const matchesSearch = search === "" || Object.values(row).some(val =>
                String(val).toLowerCase().includes(search.toLowerCase())
            );

            // 2. Check Filters
            const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
                return row[key] === value;
            });

            return matchesSearch && matchesFilters;
        })
        : [];

    const activeFilterCount = Object.keys(activeFilters).length;

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            {/* Table Header */}
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>

                <div className="flex flex-wrap items-center gap-4 relative">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search records..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm text-gray-900"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {filters && filters.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`p-3 border rounded-xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${activeFilterCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-gray-500 hover:text-gray-900'}`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] ml-1">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showFilterDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowFilterDropdown(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-6 space-y-6"
                                        >
                                            {filters.map(filter => (
                                                <div key={filter.key} className="space-y-3">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                                        {filter.label}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {filter.options.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => toggleFilter(filter.key, opt.value)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeFilters[filter.key] === opt.value ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                            >
                                                                {opt.label}
                                                                {activeFilters[filter.key] === opt.value && <Check className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="pt-4 border-t border-gray-50 flex gap-2">
                                                <button
                                                    onClick={clearFilters}
                                                    className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest"
                                                >
                                                    Clear All
                                                </button>
                                                <button
                                                    onClick={() => setShowFilterDropdown(false)}
                                                    className="flex-1 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-900 hover:bg-gray-100 transition-all uppercase tracking-widest"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
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
                        {filteredData.length > 0 ? (
                            filteredData.map((row, idx) => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-20 text-center">
                                    {loading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading records...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No records found matching your criteria</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
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
                    <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-900 hover:bg-gray-50 shadow-sm transition-all text-sm font-bold flex items-center gap-1">
                        1
                    </button>
                    <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-900 hover:bg-gray-50 shadow-sm transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
