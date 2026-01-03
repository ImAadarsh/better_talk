"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DataTable from "@/components/admin/DataTable";
import {
    User, Shield, Stethoscope, MoreVertical, Edit2, Ban,
    Eye, UserPlus, Unlock, X, CheckCircle
} from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any>(null);
    const router = useRouter();

    const fetchUsers = async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (userId: number, action: string) => {
        const confirmMsg = action === "make_admin"
            ? "Are you sure you want to promote this user to Administrator?"
            : action === "demote_user"
                ? "Are you sure you want to demote this Administrator to a regular user?"
                : action === "block"
                    ? "Are you sure you want to block this user?"
                    : "Are you sure you want to unblock this user?";

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            } else {
                alert(data.error || "Action failed");
            }
        } catch (error) {
            console.error("Action error:", error);
            alert("Something went wrong");
        }
    };

    const handleEditClick = async (userId: number) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            const data = await res.json();
            if (data.user) {
                setEditingUser(data.user);
            }
        } catch (error) {
            console.error("Fetch user details error:", error);
            alert("Could not load user details");
        }
    };

    const handleUpdateUser = async (formData: any) => {
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_info",
                    ...formData
                })
            });
            const data = await res.json();
            if (data.success) {
                setEditingUser(null);
                fetchUsers();
            } else {
                alert(data.error || "Update failed");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong");
        }
    };

    const columns = [
        {
            key: "name",
            label: "User Profile",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-100 ring-2 ring-white shadow-sm">
                        {row.image || row.avatar_url ? (
                            <Image
                                src={row.image || row.avatar_url}
                                alt={val}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized={!(row.image?.startsWith('http') || row.avatar_url?.startsWith('http'))}
                            />
                        ) : (
                            val.charAt(0)
                        )}
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
            <button
                onClick={() => router.push(`/adx/users/${row.id}`)}
                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600 hover:shadow-sm"
                title="View Details"
            >
                <Eye className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleEditClick(row.id)}
                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600 hover:shadow-sm"
                title="Edit User"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            {row.role === 'admin' ? (
                <button
                    onClick={() => handleAction(row.id, "demote_user")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-amber-600 hover:shadow-sm"
                    title="Demote to User"
                >
                    <UserPlus className="w-4 h-4 rotate-180" />
                </button>
            ) : (
                <button
                    onClick={() => handleAction(row.id, "make_admin")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-green-600 hover:shadow-sm"
                    title="Make Admin"
                >
                    <UserPlus className="w-4 h-4" />
                </button>
            )}

            {row.status === 'active' ? (
                <button
                    onClick={() => handleAction(row.id, "block")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-red-500 hover:shadow-sm"
                    title="Block User"
                >
                    <Ban className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={() => handleAction(row.id, "unblock")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-green-500 hover:shadow-sm"
                    title="Unblock User"
                >
                    <Unlock className="w-4 h-4" />
                </button>
            )}
        </div>
    );

    if (loading && users.length === 0) {
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
                <p className="text-gray-500 font-medium">View and manage all registered accounts (Users & Admins).</p>
            </div>

            <DataTable
                title="User Directory"
                columns={columns}
                data={users}
                actions={actions}
                filters={[
                    {
                        key: "role",
                        label: "User Role",
                        options: [
                            { value: "user", label: "User" },
                            { value: "admin", label: "Admin" }
                        ]
                    },
                    {
                        key: "status",
                        label: "Account Status",
                        options: [
                            { value: "active", label: "Active" },
                            { value: "banned", label: "Banned" }
                        ]
                    }
                ]}
            />

            <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleUpdateUser}
            />
        </div>
    );
}

function EditUserModal({ user, onClose, onSave }: { user: any, onClose: () => void, onSave: (data: any) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        phone: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                age: user.age || "",
                phone: user.phone_number || ""
            });
        }
    }, [user]);

    if (!user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Edit Profile</h2>
                            <p className="text-sm font-medium text-gray-400">Update account credentials for {user.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-gray-900">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold bg-gray-900 text-white shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            Save Changes
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
