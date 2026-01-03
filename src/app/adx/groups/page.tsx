"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import ScientificLoader from "@/components/ScientificLoader";
import { Plus, Users, Globe, ToggleLeft, ToggleRight, Trash2, Edit2, X, Check, Loader2 } from "lucide-react";

export default function AdminGroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        is_active: 1
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/admin/groups");
            const data = await res.json();
            setGroups(data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (group: any) => {
        setSelectedGroup(group);
        setFormData({
            name: group.name,
            slug: group.slug,
            description: group.description || "",
            is_active: group.is_active
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = selectedGroup ? `/api/admin/groups/${selectedGroup.id}` : "/api/admin/groups";
            const method = selectedGroup ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setSelectedGroup(null);
                fetchGroups();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this community? All posts and memberships will be affected.")) return;
        try {
            const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
            if (res.ok) fetchGroups();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        { key: "id", label: "ID" },
        {
            key: "name",
            label: "Community",
            render: (val: string, item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val}</div>
                        <div className="text-[10px] text-gray-400 font-medium">/{item.slug}</div>
                    </div>
                </div>
            )
        },
        {
            key: "description",
            label: "Description",
            render: (val: string) => <p className="max-w-xs truncate text-xs text-gray-500">{val || "No description"}</p>
        },
        {
            key: "is_active",
            label: "Status",
            render: (val: number) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${val === 1 ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                    {val === 1 ? "Active" : "Hidden"}
                </span>
            )
        },
        {
            key: "creator_name",
            label: "Created By",
            render: (val: string) => <span className="text-xs text-gray-600 font-medium">{val || "System"}</span>
        },
    ];

    const actions = (group: any) => (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => handleEdit(group)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDelete(group.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    if (loading) return <div className="flex justify-center py-20"><ScientificLoader /></div>;

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight italic">Communities</h1>
                    <p className="text-gray-500 font-medium">Manage support groups and discussion circles.</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setSelectedGroup(null); setFormData({ name: "", slug: "", description: "", is_active: 1 }); }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/10"
                >
                    <Plus className="w-4 h-4" /> Create Community
                </button>
            </div>

            <DataTable
                title="Active Communities"
                columns={columns}
                data={groups}
                actions={actions}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGroup ? "Edit Community" : "New Community"}</h2>
                        <p className="text-gray-500 text-sm mb-8">Set up a space for users to connect and support each other.</p>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Group Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                        placeholder="e.g. Anxiety Warriors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Slug</label>
                                    <input
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                                        placeholder="anxiety-warriors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                    placeholder="What is this group about?"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: formData.is_active === 1 ? 0 : 1 })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs ${formData.is_active === 1 ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"
                                        }`}
                                >
                                    {formData.is_active === 1 ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    {formData.is_active === 1 ? "Active Community" : "Hidden Community"}
                                </button>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Community</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
