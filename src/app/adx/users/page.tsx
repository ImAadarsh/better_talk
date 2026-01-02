"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { User, Shield, Stethoscope, MoreVertical, Edit2, Trash2, Ban } from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";

export default function UsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/admin/users");
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const columns = [
        {
            key: "name",
            label: "User Profile",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {val.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val}</div>
                        <div className="text-xs text-gray-400 font-medium">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: "role",
            label: "Role",
            render: (val: string) => {
                const colors = {
                    admin: "bg-gray-900 text-white",
                    mentor: "bg-blue-100 text-blue-700",
                    user: "bg-gray-100 text-gray-600",
                };
                const Icon = val === "admin" ? Shield : val === "mentor" ? Stethoscope : User;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[val as keyof typeof colors]}`}>
                        <Icon className="w-3 h-3" />
                        {val}
                    </div>
                );
            }
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${val === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${val === "active" ? "bg-green-500" : "bg-red-500"}`}></span>
                    {val}
                </div>
            )
        },
        {
            key: "joined",
            label: "Joined At",
            render: (val: string) => (
                <span className="text-gray-500 font-medium">{val}</span>
            )
        }
    ];

    const actions = (row: any) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600 hover:shadow-sm" title="Edit User">
                <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-red-500 hover:shadow-sm" title="Ban User">
                <Ban className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-gray-900 hover:shadow-sm">
                <MoreVertical className="w-4 h-4" />
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
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-gray-500 font-medium">View and manage all registered accounts.</p>
            </div>

            <DataTable
                title="All Users"
                columns={columns}
                data={users}
                actions={actions}
            />
        </div>
    );
}
