"use client";

import { useEffect, useState } from "react";
import TherapistLayout from "@/components/TherapistLayout";
import { Loader2, User, Edit2, BadgeCheck, Stethoscope } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface MentorProfile {
    id: number;
    user_id: number;
    designation: string;
    headlines: string;
    patients_treated: number;
    is_verified: number;
    // Joined with user table
    name: string;
    email: string;
    image: string;
    bio: string; // from user table? Mentors might want a separate bio, but let's use user bio for now or assume extended schema.
    // Actually our previous schema update for mentors was designation, contact, patients_treated, headlines. 
    // Let's assume user.bio is minimal and we might want a 'about' section.
    // For now, allow editing headlines and designation.
}

export default function TherapistProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<MentorProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        designation: "",
        headlines: "",
        patients_treated: 0,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                // leveraging the existing /api/therapist/list logic but we need specific 'me' endpoint or search.
                // Or just use the session to fetch 'my' info.
                // We'll Create /api/therapist/me specifically for this.
                const res = await fetch("/api/therapist/me");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({
                        designation: data.designation || "",
                        headlines: data.headlines || "",
                        patients_treated: data.patients_treated || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        }
        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/therapist/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsEditing(false);
                setProfile(prev => prev ? ({ ...prev, ...formData }) : null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <TherapistLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </TherapistLayout>
        );
    }

    if (!profile) {
        return (
            <TherapistLayout>
                <div className="text-center py-20">Profile not found.</div>
            </TherapistLayout>
        )
    }

    return (
        <TherapistLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header / Main Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-blue-400 opacity-10"></div>

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 mt-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 shrink-0">
                            {profile.image ? (
                                <Image src={profile.image} alt={profile.name} width={128} height={128} className="object-cover w-full h-full" />
                            ) : (
                                <User className="w-full h-full p-6 text-gray-400" />
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                {profile.is_verified === 1 && (
                                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500 text-white" />
                                )}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
                                <Stethoscope className="w-4 h-4" />
                                <span className="font-medium">{profile.designation}</span>
                            </div>
                            <p className="text-gray-600 max-w-xl">{profile.headlines}</p>
                            <div className="pt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    {profile.patients_treated}+ Patients Treated
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-full shadow-sm border border-gray-100"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-slide-in-up">
                        <h2 className="text-xl font-bold mb-6 text-gray-900">Edit Professional Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                                <input
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Patients Treated</label>
                                <input
                                    type="number"
                                    value={formData.patients_treated}
                                    onChange={(e) => setFormData({ ...formData, patients_treated: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Headline / Bio</label>
                                <textarea
                                    value={formData.headlines}
                                    onChange={(e) => setFormData({ ...formData, headlines: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px]"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </TherapistLayout>
    );
}
