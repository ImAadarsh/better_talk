"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { MessageSquare, Mail, User, Clock, Eye, Trash2, Reply } from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";

export default function MessagesPage() {
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch("/api/admin/messages");
                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const columns = [
        {
            key: "created_at",
            label: "Timestamp",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {val}
                </div>
            )
        },
        {
            key: "name",
            label: "Sender",
            render: (val: string, row: any) => (
                <div>
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                </div>
            )
        },
        {
            key: "subject",
            label: "Subject",
            render: (val: string) => (
                <span className="font-bold text-gray-700">{val}</span>
            )
        },
        {
            key: "message",
            label: "Preview",
            render: (val: string) => (
                <p className="text-sm text-gray-500 truncate max-w-xs">{val}</p>
            )
        }
    ];

    const actions = (row: any) => (
        <div className="flex items-center justify-end gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                <Eye className="w-4 h-4" />
                View
            </button>
            <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                <Reply className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <ScientificLoader />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Support Inbox</h1>
                <p className="text-gray-500 font-medium">Managing communications and user feedback.</p>
            </div>

            <DataTable
                title="All Messages"
                columns={columns}
                data={messages}
                actions={actions}
            />
        </div>
    );
}
