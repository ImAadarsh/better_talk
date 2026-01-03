"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { Plus, Edit2, Trash2, Eye, EyeOff, HelpCircle, Save, X } from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";
import { motion, AnimatePresence } from "framer-motion";

export default function FaqsPage() {
    const [loading, setLoading] = useState(true);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/faqs");
            const data = await res.json();
            setFaqs(data);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
            fetchFaqs();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleToggleStatus = async (item: any) => {
        try {
            await fetch(`/api/admin/faqs/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: item.is_active ? 0 : 1 })
            });
            fetchFaqs();
        } catch (error) {
            console.error("Status toggle error:", error);
        }
    };

    const handleSave = async (data: any) => {
        try {
            const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : "/api/admin/faqs";
            const method = editingFaq ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingFaq(null);
                fetchFaqs();
            } else {
                alert("Failed to save FAQ");
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const openCreateModal = () => {
        setEditingFaq(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingFaq(item);
        setIsModalOpen(true);
    };

    const columns = [
        {
            key: "question",
            label: "Question",
            render: (val: string) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                        <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-900 line-clamp-2">{val}</span>
                </div>
            )
        },
        {
            key: "answer",
            label: "Answer",
            render: (val: string) => (
                <span className="text-gray-500 text-sm line-clamp-2 max-w-sm">{val}</span>
            )
        },
        {
            key: "priority",
            label: "Priority",
            render: (val: number) => (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">
                    {val}
                </span>
            )
        },
        {
            key: "is_active",
            label: "Status",
            render: (val: number) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${val ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {val ? "Active" : "Draft"}
                </span>
            )
        }
    ];

    const actions = (row: any) => (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => handleToggleStatus(row)}
                className={`p-2 rounded-lg transition-all ${row.is_active ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                title={row.is_active ? "Deactivate" : "Activate"}
            >
                {row.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
                onClick={() => openEditModal(row)}
                className="p-2 hover:bg-blue-50 rounded-lg transition-all text-gray-400 hover:text-blue-600"
                title="Edit"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDelete(row.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-500"
                title="Delete"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    if (loading && faqs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <ScientificLoader />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">FAQ Management</h1>
                    <p className="text-gray-500 font-medium">Manage frequently asked questions for the help center.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10"
                >
                    <Plus className="w-5 h-5" />
                    Add New FAQ
                </button>
            </div>

            <DataTable
                title="FAQs"
                columns={columns}
                data={faqs}
                actions={actions}
            />

            <FaqModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingFaq}
            />
        </div>
    );
}

function FaqModal({ isOpen, onClose, onSave, initialData }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, initialData?: any }) {
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        priority: 0,
        is_active: 1
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                question: initialData.question,
                answer: initialData.answer,
                priority: initialData.priority,
                is_active: initialData.is_active
            });
        } else {
            setFormData({
                question: "",
                answer: "",
                priority: 0,
                is_active: 1
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

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
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {initialData ? "Edit FAQ" : "Create New FAQ"}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Question</label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-gray-900"
                                placeholder="Enter the question..."
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Answer</label>
                            <textarea
                                rows={4}
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-medium text-gray-900 resize-none"
                                placeholder="Enter the answer..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Priority</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Status</label>
                                <select
                                    value={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                                >
                                    <option value={1}>Active</option>
                                    <option value={0}>Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold bg-gray-900 text-white shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Item
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
