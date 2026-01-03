"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/admin/DataTable";
import ScientificLoader from "@/components/ScientificLoader";
import { Shield, MessageSquare, FileText, Trash2, User, Calendar, ExternalLink, ThumbsUp, AlertCircle, Edit2, X, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ContentModerationPage() {
    const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editContent, setEditContent] = useState("");
    const [updating, setUpdating] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === "posts" ? "/api/admin/moderation/posts" : "/api/admin/moderation/comments";
            const res = await fetch(endpoint);
            const data = await res.json();
            setItems(data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (!confirm(`Are you sure you want to delete this ${activeTab === "posts" ? "post" : "comment"}?`)) return;
        try {
            const endpoint = activeTab === "posts" ? "/api/admin/moderation/posts" : "/api/admin/moderation/comments";
            const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setEditContent(item.content);
        setShowModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setUpdating(true);
        try {
            const endpoint = activeTab === "posts" ? "/api/admin/moderation/posts" : "/api/admin/moderation/comments";
            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingItem.id, content: editContent })
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            } else {
                alert("Failed to update content");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const postColumns = [
        { key: "id", label: "ID" },
        {
            key: "content",
            label: "Post Detail",
            render: (val: string, item: any) => (
                <div className="max-w-md">
                    <p className="text-sm text-gray-900 font-medium line-clamp-2">{val}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{item.group_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(item.created_at), 'MMM do, HH:mm')}</span>
                    </div>
                </div>
            )
        },
        {
            key: "author_name",
            label: "Author",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{val}</span>
                </div>
            )
        }
    ];

    const commentColumns = [
        { key: "id", label: "ID" },
        {
            key: "content",
            label: "Comment",
            render: (val: string, item: any) => (
                <div className="max-w-md">
                    <p className="text-sm text-gray-900 font-medium">{val}</p>
                    <p className="text-[10px] text-gray-400 mt-1 italic line-clamp-1">on post: {item.post_content}</p>
                </div>
            )
        },
        {
            key: "author_name",
            label: "Author",
            render: (val: string) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{val}</span>
                </div>
            )
        },
        {
            key: "created_at",
            label: "Date",
            render: (val: string) => <span className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(val), 'MMM do, HH:mm')}</span>
        }
    ];

    const actions = (item: any) => (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => handleEdit(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit Content"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Content"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 italic">
                    <Shield className="w-8 h-8 text-red-500" /> Content Moderation
                </h1>
                <p className="text-gray-500 font-medium">Keep our communities safe and supportive.</p>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "posts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    <FileText className="w-4 h-4" /> Posts
                </button>
                <button
                    onClick={() => setActiveTab("comments")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "comments" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    <MessageSquare className="w-4 h-4" /> Comments
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><ScientificLoader /></div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <DataTable
                        title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feed`}
                        columns={activeTab === "posts" ? postColumns : commentColumns}
                        data={items}
                        actions={actions}
                        filters={
                            activeTab === "posts"
                                ? [
                                    {
                                        key: "group_name",
                                        label: "Community",
                                        options: Array.from(new Set(items.map(i => i.group_name))).map(name => ({ label: name, value: name }))
                                    },
                                    {
                                        key: "author_role",
                                        label: "Author Role",
                                        options: [
                                            { label: "User", value: "user" },
                                            { label: "Therapist", value: "mentor" },
                                            { label: "Admin", value: "admin" }
                                        ]
                                    }
                                ]
                                : [
                                    {
                                        key: "author_role",
                                        label: "Author Role",
                                        options: [
                                            { label: "User", value: "user" },
                                            { label: "Therapist", value: "mentor" },
                                            { label: "Admin", value: "admin" }
                                        ]
                                    }
                                ]
                        }
                    />

                    {items.length === 0 && (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 mt-8">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ThumbsUp className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">All Clean!</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">No active {activeTab} found that need moderation at this time.</p>
                        </div>
                    )}
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit {activeTab === "posts" ? "Post" : "Comment"}</h2>
                        <p className="text-gray-500 text-sm mb-8">Modify the content for compliance or clarity.</p>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Content</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                    placeholder="Type content here..."
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
