"use client";

import { useState, useEffect } from "react";
import ScientificLoader from "@/components/ScientificLoader";
import DataTable from "@/components/admin/DataTable";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, DollarSign, Clock, User } from "lucide-react";

export default function PlanManagementPage() {
    const [loading, setLoading] = useState(true);
    const [therapists, setTherapists] = useState<any[]>([]);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
    const [plans, setPlans] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [formData, setFormData] = useState({
        price_in_inr: "",
        session_duration_min: "60",
        chat_window_days: "0",
        is_active: 1
    });

    useEffect(() => {
        fetchTherapists();
    }, []);

    useEffect(() => {
        if (selectedTherapistId) {
            fetchPlans(selectedTherapistId);
        } else {
            setPlans([]);
        }
    }, [selectedTherapistId]);

    const fetchTherapists = async () => {
        try {
            const res = await fetch("/api/admin/therapists");
            const data = await res.json();
            setTherapists(data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch therapists", error);
        }
    };

    const fetchPlans = async (mentorId: string) => {
        try {
            const res = await fetch(`/api/admin/plans?mentor_id=${mentorId}`);
            const data = await res.json();
            setPlans(data || []);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const handleSavePlan = async () => {
        if (!selectedTherapistId) return;

        const method = editingPlan ? "PATCH" : "POST";
        const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : "/api/admin/plans";

        const payload = {
            ...formData,
            mentor_id: selectedTherapistId,
            price_in_inr: parseInt(formData.price_in_inr),
            chat_window_days: parseInt(formData.chat_window_days),
            is_active: parseInt(formData.is_active as any)
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingPlan(null);
                fetchPlans(selectedTherapistId);
            } else {
                alert("Failed to save plan");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePlan = async (id: number) => {
        if (!confirm("Are you sure? This will also delete any slots associated with this plan.")) return;
        try {
            const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
            if (res.ok) fetchPlans(selectedTherapistId);
        } catch (error) {
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            price_in_inr: "",
            session_duration_min: "60",
            chat_window_days: "0",
            is_active: 1
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: any) => {
        setEditingPlan(plan);
        setFormData({
            price_in_inr: plan.price_in_inr.toString(),
            session_duration_min: plan.session_duration_min.toString(),
            chat_window_days: plan.chat_window_days.toString(),
            is_active: plan.is_active
        });
        setIsModalOpen(true);
    };

    const columns = [
        {
            key: "id",
            label: "ID",
            render: (val: any) => <span className="text-gray-400 font-mono text-xs">#{val}</span>
        },
        {
            key: "price_in_inr",
            label: "Price (INR)",
            render: (val: any) => (
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                    {val}
                </div>
            )
        },
        {
            key: "session_duration_min",
            label: "Duration",
            render: (val: any) => (
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {val} mins
                </div>
            )
        },
        {
            key: "chat_window_days",
            label: "Chat Window",
            render: (val: any) => <span className="text-gray-500">{val} days</span>
        },
        {
            key: "is_active",
            label: "Status",
            render: (val: any) => (
                val === 1 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 uppercase tracking-wider">
                        <XCircle className="w-3 h-3" /> Inactive
                    </span>
                )
            )
        }
    ];

    const actions = (row: any) => (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => openEditModal(row)}
                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600 hover:shadow-sm"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDeletePlan(row.id)}
                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-red-500 hover:shadow-sm"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    if (loading) return <div className="flex justify-center py-20"><ScientificLoader /></div>;

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Plan Management</h1>
                    <p className="text-gray-500 font-medium">Define session pricing and duration packages for therapists.</p>
                </div>
                {selectedTherapistId && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Create New Plan
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <User className="w-6 h-6" />
                </div>
                <div className="flex-1 max-w-sm">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Select Therapist</label>
                    <select
                        value={selectedTherapistId}
                        onChange={(e) => setSelectedTherapistId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white outline-none transition-all font-bold text-gray-900"
                    >
                        <option value="">-- Select a Therapist --</option>
                        {therapists.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedTherapistId ? (
                <DataTable
                    title="Configured Plans"
                    columns={columns}
                    data={plans}
                    actions={actions}
                />
            ) : (
                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <User className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Therapist Selected</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Please select a therapist from the dropdown above to manage their session plans.</p>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">{editingPlan ? "Edit Plan" : "Create New Plan"}</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price in INR</label>
                                <input
                                    type="number"
                                    value={formData.price_in_inr}
                                    onChange={(e) => setFormData({ ...formData, price_in_inr: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                    placeholder="e.g. 1500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Duration (Minutes)</label>
                                <select
                                    value={formData.session_duration_min}
                                    onChange={(e) => setFormData({ ...formData, session_duration_min: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                >
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">60 Minutes</option>
                                    <option value="90">90 Minutes</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Chat Window (Days)</label>
                                <input
                                    type="number"
                                    value={formData.chat_window_days}
                                    onChange={(e) => setFormData({ ...formData, chat_window_days: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active === 1}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                    className="w-5 h-5 rounded-lg accent-gray-900"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-gray-700 select-none">Plan is Active</label>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePlan}
                                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/10"
                            >
                                Save Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
