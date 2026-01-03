"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Star, Quote } from "lucide-react";
import { useRouter } from "next/navigation";

interface Story {
    id: number;
    author_name: string;
    author_role: string;
    title: string;
    content: string;
    rating: number;
    is_active: number;
    created_at: string;
}

export default function AdminStories() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        author_name: "",
        author_role: "User",
        title: "",
        content: "",
        rating: 5,
        is_active: true
    });

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await fetch("/api/admin/stories");
            const data = await res.json();
            if (Array.isArray(data)) {
                setStories(data);
            }
        } catch (error) {
            console.error("Failed to fetch stories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this story?")) return;
        try {
            const res = await fetch(`/api/admin/stories?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchStories();
        } catch (error) {
            console.error("Failed to delete story", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const method = editingStory ? "PATCH" : "POST";
            const payload = editingStory ? { ...formData, id: editingStory.id } : formData;

            const res = await fetch("/api/admin/stories", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingStory(null);
                setFormData({
                    author_name: "",
                    author_role: "User",
                    title: "",
                    content: "",
                    rating: 5,
                    is_active: true
                });
                fetchStories();
            }
        } catch (error) {
            console.error("Failed to save story", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (story: Story) => {
        setEditingStory(story);
        setFormData({
            author_name: story.author_name,
            author_role: story.author_role,
            title: story.title || "",
            content: story.content,
            rating: story.rating,
            is_active: story.is_active === 1
        });
        setShowModal(true);
    };

    const columns = [
        {
            key: "author",
            label: "Author",
            render: (_: any, row: Story) => (
                <div>
                    <div className="font-bold text-gray-900">{row.author_name}</div>
                    <div className="text-xs text-blue-600 font-medium">{row.author_role}</div>
                </div>
            )
        },
        {
            key: "content",
            label: "Snippet",
            render: (_: any, row: Story) => (
                <div className="max-w-xs">
                    {row.title && <div className="font-bold text-[10px] uppercase text-gray-500 mb-1">{row.title}</div>}
                    <p className="text-sm text-gray-600 truncate">{row.content}</p>
                </div>
            )
        },
        {
            key: "rating",
            label: "Rating",
            sortable: true,
            render: (_: any, row: Story) => (
                <div className="flex items-center gap-0.5 text-amber-500">
                    <span className="font-bold text-sm mr-1.5 text-gray-700">{row.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (_: any, row: Story) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${row.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {row.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {row.is_active ? 'Active' : 'Draft'}
                </span>
            )
        },
        {
            key: "actions",
            label: "",
            render: (_: any, row: Story) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => openEdit(row)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Story"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Story"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Success Stories</h1>
                    <p className="text-gray-500 font-medium">Manage testimonials and user success stories.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingStory(null);
                        setFormData({
                            author_name: "",
                            author_role: "User",
                            title: "",
                            content: "",
                            rating: 5,
                            is_active: true
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
                >
                    <Plus className="w-5 h-5" />
                    New Story
                </button>
            </div>

            <DataTable
                title=""
                columns={columns}
                data={stories}
                loading={loading}
                searchPlaceholder="Search stories..."
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingStory ? "Edit Story" : "New Story"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Author Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                                        value={formData.author_name}
                                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role / Tagline</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                                        value={formData.author_role}
                                        onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                                        placeholder="e.g. Anxiety Warrior"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Story Title (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. How BetterTalk saved me..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Variables</label>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                        <span className="text-sm font-bold text-gray-500">Rating:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                        />
                                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                                    </div>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`
                                            w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out
                                            ${formData.is_active ? 'bg-green-500' : 'bg-gray-200'}
                                        `}>
                                            <div className={`
                                                w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out
                                                ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}
                                            `} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">
                                            {formData.is_active ? 'Published' : 'Draft'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Testimonial Content</label>
                                <div className="relative">
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium resize-none pl-10"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Share the success story..."
                                    />
                                    <Quote className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    {editingStory ? "Update Story" : "Create Story"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
