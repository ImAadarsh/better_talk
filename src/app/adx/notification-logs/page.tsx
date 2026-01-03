"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    User, Search, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Bell
} from "lucide-react";
import { format, parseISO } from "date-fns";
import DataTable, { Column, FilterConfig } from "@/components/admin/DataTable";

interface NotificationLog {
    id: number;
    type: string;
    reference_type: string | null;
    reference_id: number | null;
    sent_at: string;
    status: 'success' | 'failed';
    error_message: string | null;
    user_name: string;
    user_email: string;
    user_image?: string;
    user_avatar?: string;
}

export default function NotificationLogsPage() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<NotificationLog[]>([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/admin/notification-logs");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column[] = [
        {
            key: "id",
            label: "ID",
            render: (val: any) => <span className="font-bold text-gray-400 text-xs">#{val}</span>
        },
        {
            key: "user_name",
            label: "User",
            render: (_: any, row: NotificationLog) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {(row.user_image || row.user_avatar) ? (
                            <Image
                                src={row.user_image || row.user_avatar!}
                                alt={row.user_name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm">{row.user_name || "Unknown User"}</span>
                        <span className="text-xs text-gray-500">{row.user_email}</span>
                    </div>
                </div>
            )
        },
        {
            key: "type",
            label: "Notification Type",
            render: (val: string) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-600">
                    <Bell className="w-3.5 h-3.5" />
                    {val.replace(/_/g, " ")}
                </span>
            )
        },
        {
            key: "reference_type",
            label: "Reference",
            render: (val: string | null, row: NotificationLog) => val ? (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {val}: #{row.reference_id}
                </span>
            ) : <span className="text-gray-400 text-xs">-</span>
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                    ${val === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
                `}>
                    {val === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {val}
                </span>
            )
        },
        {
            key: "sent_at",
            label: "Sent At",
            render: (val: string) => (
                <div className="flex flex-col text-xs text-gray-600">
                    <span className="font-medium">{format(parseISO(val), "MMM dd, yyyy")}</span>
                    <span className="text-gray-400">{format(parseISO(val), "h:mm a")}</span>
                </div>
            )
        },
        {
            key: "error_message",
            label: "Details",
            render: (val: string | null) => val ? (
                <div className="group relative">
                    <AlertTriangle className="w-4 h-4 text-amber-500 cursor-help" />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {val}
                    </div>
                </div>
            ) : null
        }
    ];

    const filters: FilterConfig[] = [
        {
            key: "status",
            label: "Status",
            options: [
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" }
            ]
        }
    ];

    return (
        <div className="p-8">
            <DataTable
                title="Notification Logs"
                columns={columns}
                data={logs}
                loading={loading}
                filters={filters}
                searchPlaceholder="Search logs..."
            />
        </div>
    );
}
