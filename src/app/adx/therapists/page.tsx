"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DataTable from "@/components/admin/DataTable";
import {
    Stethoscope, CheckCircle, XCircle, MoreVertical,
    Eye, BadgeCheck, Clock, Edit2, Ban, Unlock, X, Camera, Loader2
} from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TherapistsPage() {
    const [loading, setLoading] = useState(true);
    const [therapists, setTherapists] = useState<any[]>([]);
    const [editingTherapist, setEditingTherapist] = useState<any>(null);
    const router = useRouter();

    const fetchTherapists = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/therapists");
            const data = await res.json();
            setTherapists(data);
        } catch (error) {
            console.error("Error fetching therapists:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    const handleAction = async (id: number, action: string) => {
        const confirmMsg = action === "approve"
            ? "Are you sure you want to verify this therapist?"
            : action === "block"
                ? "Are you sure you want to block this therapist's account?"
                : "Are you sure you want to restore this account?";

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/admin/therapists/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                fetchTherapists();
            } else {
                alert(data.error || "Action failed");
            }
        } catch (error) {
            console.error("Action error:", error);
            alert("Something went wrong");
        }
    };

    const handleEditClick = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/therapists/${id}`);
            const data = await res.json();
            if (data.therapist) {
                setEditingTherapist(data.therapist);
            }
        } catch (error) {
            console.error("Fetch therapist error:", error);
            alert("Could not load therapist details");
        }
    };

    const handleUpdateTherapist = async (formData: any) => {
        try {
            const res = await fetch(`/api/admin/therapists/${editingTherapist.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_info",
                    ...formData
                })
            });
            const data = await res.json();
            if (data.success) {
                setEditingTherapist(null);
                fetchTherapists();
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
            label: "Therapist Detail",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-100 shadow-sm">
                        {row.image || row.avatar_url ? (
                            <Image
                                src={row.image || row.avatar_url}
                                alt={val}
                                width={48} // 12 * 4
                                height={48}
                                className="w-full h-full object-cover"
                                unoptimized={!(row.image?.startsWith('http') || row.avatar_url?.startsWith('http'))}
                            />
                        ) : (
                            <Stethoscope className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{val}</span>
                            {row.is_verified === 1 && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">{row.designation || "No Designation"}</div>
                    </div>
                </div>
            )
        },
        {
            key: "experience",
            label: "Experience",
            render: (val: string) => (
                <div className="flex items-center gap-2 text-gray-600 font-bold">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {val}
                </div>
            )
        },
        {
            key: "patients",
            label: "Capacity",
            render: (val: number) => (
                <div className="font-bold text-gray-700">
                    {val}+ <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Patients</span>
                </div>
            )
        },
        {
            key: "is_verified",
            label: "Status",
            render: (val: number, row: any) => (
                <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${val === 1 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {val === 1 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {val === 1 ? "Verified" : "Pending"}
                    </div>
                    {row.status === 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-widest ml-1">
                            <Ban className="w-2.5 h-2.5" /> Blocked
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "applied",
            label: "Applied",
            render: (val: string) => (
                <span className="text-gray-400 text-xs font-semibold">{val}</span>
            )
        }
    ];

    const actions = (row: any) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
                onClick={() => router.push(`/adx/therapists/${row.id}`)}
                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600 hover:shadow-sm"
                title="Review Details"
            >
                <Eye className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleEditClick(row.id)}
                className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-indigo-600 hover:shadow-sm"
                title="Edit Profile"
            >
                <Edit2 className="w-4 h-4" />
            </button>
            {row.is_verified === 0 && (
                <button
                    onClick={() => handleAction(row.id, "approve")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-green-600 hover:shadow-sm"
                    title="Verify"
                >
                    <BadgeCheck className="w-4 h-4" />
                </button>
            )}
            {row.status === 1 ? (
                <button
                    onClick={() => handleAction(row.id, "block")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-red-500 hover:shadow-sm"
                    title="Block Access"
                >
                    <Ban className="w-4 h-4" />
                </button>
            ) : (
                <button
                    onClick={() => handleAction(row.id, "unblock")}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-green-500 hover:shadow-sm"
                    title="Unblock Access"
                >
                    <Unlock className="w-4 h-4" />
                </button>
            )}
        </div>
    );

    if (loading && therapists.length === 0) {
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Therapist Verification</h1>
                    <p className="text-gray-500 font-medium">Onboard and manage professional therapist credentials.</p>
                </div>
            </div>

            <DataTable
                title="Application Directory"
                columns={columns}
                data={therapists}
                actions={actions}
                filters={[
                    {
                        key: "is_verified",
                        label: "Verification",
                        options: [
                            { value: 1, label: "Verified" },
                            { value: 0, label: "Pending" }
                        ]
                    },
                    {
                        key: "status",
                        label: "Account Status",
                        options: [
                            { value: 1, label: "Active" },
                            { value: 0, label: "Blocked" }
                        ]
                    }
                ]}
            />

            <EditTherapistModal
                therapist={editingTherapist}
                onClose={() => setEditingTherapist(null)}
                onSave={handleUpdateTherapist}
            />
        </div>
    );
}

function EditTherapistModal({ therapist, onClose, onSave }: { therapist: any, onClose: () => void, onSave: (data: any) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        image: "",
        avatar_url: "",
        designation: "",
        experience: "",
        patients: "",
        bio: "",
        headlines: "",
        expertise_tags: ""
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (therapist) {
            setFormData({
                name: therapist.name || "",
                email: therapist.email || "",
                image: therapist.image || "",
                avatar_url: therapist.avatar_url || "",
                designation: therapist.designation || "",
                experience: therapist.experience_years || "",
                patients: therapist.patients_treated || "",
                bio: therapist.bio || "",
                headlines: therapist.headlines || "",
                expertise_tags: therapist.expertise_tags || ""
            });
        }
    }, [therapist]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            setFormData(prev => ({ ...prev, image: url }));
        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    if (!therapist) return null;

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
                    className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Edit Therapist Profile</h2>
                            <p className="text-sm font-medium text-gray-400">Update professional details for Dr. {therapist.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-gray-900">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-8 mb-10 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg bg-gray-200 shrink-0 relative">
                                {formData.image || formData.avatar_url ? (
                                    <Image
                                        src={formData.image || formData.avatar_url}
                                        alt={formData.name}
                                        width={96} // 24 * 4
                                        height={96}
                                        className="object-cover w-full h-full"
                                        unoptimized={!(formData.image?.startsWith('http') || formData.avatar_url?.startsWith('http'))}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                        <Stethoscope className="w-8 h-8" />
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-2.5 rounded-xl shadow-xl hover:bg-gray-800 transition-all z-10 border-2 border-white"
                                title="Change Photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">Profile Identity</h3>
                            <p className="text-gray-500 text-xs font-medium mt-1">Upload a professional headshot for the public directory.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 max-h-[45vh] overflow-y-auto px-1 pr-4">
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                            <input
                                type="text"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Headlines</label>
                            <input
                                type="text"
                                value={formData.headlines}
                                onChange={(e) => setFormData({ ...formData, headlines: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                            <input
                                type="number"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Patients Treated</label>
                            <input
                                type="number"
                                value={formData.patients}
                                onChange={(e) => setFormData({ ...formData, patients: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bio / Professional Summary</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                            />
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
                            <CheckCircle className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
