"use client";

import { useEffect, useState, useRef } from "react";
import TherapistLayout from "@/components/TherapistLayout";
import { Loader2, User, Edit2, BadgeCheck, Stethoscope, Phone, Globe, Award, BookOpen, Clock, Camera, Activity } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ScientificLoader from "@/components/ScientificLoader";


interface MentorProfile {
    id: number;
    user_id: number;
    designation: string;
    headlines: string;
    patients_treated: number;
    is_verified: number;
    bio: string;
    contact_number: string;
    expertise_tags: string;
    languages: string;
    experience_years: number;

    // User table joins
    name: string;
    email: string;
    image?: string; // Optional as it might not be in DB but from session
}

export default function TherapistProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<MentorProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        designation: "",
        headlines: "",
        patients_treated: 0,
        bio: "",
        contact_number: "",
        expertise_tags: "",
        languages: "",
        experience_years: 0
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/therapist/me");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({
                        designation: data.designation || "",
                        headlines: data.headlines || "",
                        patients_treated: data.patients_treated || 0,
                        bio: data.bio || "",
                        contact_number: data.contact_number || "",

                        expertise_tags: data.expertise_tags || "",
                        languages: data.languages || "",
                        experience_years: data.experience_years || 0
                    });
                    // Note: We don't deliberately set image in formData because we handle it separately or implicitly.
                    // But if we want to save it on general 'Save', we might need it.
                    // However, handleImageUpload saves it immediately.
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            // 1. Upload File
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const { url } = await uploadRes.json();

            // 2. Update User Profile with new Image URL
            const updateRes = await fetch("/api/therapist/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData, // Send existing data to keep it safe (though our API updates specific fields, better safe)
                    image: url
                }),
            });

            if (updateRes.ok) {
                // Update local state
                setProfile(prev => prev ? ({ ...prev, image: url }) : null);
                // Also update session if possible? Session update requires reload or standard next-auth re-fetch.
                // For now, UI update is enough.
            }

        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <TherapistLayout>
                <div className="flex justify-center py-20">
                    <ScientificLoader />
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

    const expertiseTags = profile.expertise_tags ? profile.expertise_tags.split(',').map(tag => tag.trim()) : [];
    const languages = profile.languages ? profile.languages.split(',').map(l => l.trim()) : [];

    return (
        <TherapistLayout>
            <div className="w-full space-y-8 pb-10">
                {/* Header / Main Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-blue-400 opacity-10"></div>

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 mt-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 shrink-0 relative">
                                {profile.image || session?.user?.image ? (
                                    <Image
                                        src={profile.image || session?.user?.image || ""}
                                        alt={profile.name}
                                        width={128}
                                        height={128}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <User className="w-full h-full p-6 text-gray-400" />
                                )}

                                {/* Loading Overlay */}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Change Photo Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors z-10"
                                title="Change Profile Photo"
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

                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                {profile.is_verified === 1 && (
                                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500 text-white" />
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1">
                                    <Stethoscope className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-gray-900">{profile.designation || "No Designation"}</span>
                                </span>
                                {profile.experience_years > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span>{profile.experience_years} Years Exp.</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Globe className="w-4 h-4 text-green-500" />
                                    <span>{profile.languages || "Language not set"}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <Activity className="w-4 h-4 text-purple-500" />
                                    <span>Plan-based Pricing</span>
                                </span>
                            </div>

                            <p className="text-gray-600 max-w-2xl italic">&quot;{profile.headlines || "No headline added yet."}&quot;</p>

                            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                    {profile.patients_treated}+ Patients Treated
                                </span>
                                {expertiseTags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* About Section */}
                {!isEditing && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" /> About Me
                        </h2>
                        <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                            {profile.bio || "No biography provided."}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Contact
                                </h3>
                                <p className="text-gray-600">{profile.contact_number || "Not provided"}</p>
                                <p className="text-gray-600">{profile.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Expertise
                                </h3>
                                <p className="text-gray-600">{profile.expertise_tags || "None listed"}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Form */}
                {isEditing && (
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-slide-in-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-2">
                            <Edit2 className="w-6 h-6 text-blue-500" /> Edit Profile
                        </h2>

                        <div className="space-y-8">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Professional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                                        <input
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="e.g. Clinical Psychologist"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                        <input
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Patients Treated</label>
                                        <input
                                            type="number"
                                            value={formData.patients_treated}
                                            onChange={(e) => setFormData({ ...formData, patients_treated: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                        <input
                                            value={formData.contact_number}
                                            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="+91 99999 99999"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Expertise */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Expertise & Skills</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Languages (comma separated)</label>
                                        <input
                                            value={formData.languages}
                                            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="English, Hindi, Telugu"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expertise Tags (comma separated)</label>
                                        <input
                                            value={formData.expertise_tags}
                                            onChange={(e) => setFormData({ ...formData, expertise_tags: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="Anxiety, Depression, Career Counseling"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Bio</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Headline (Short)</label>
                                        <input
                                            value={formData.headlines}
                                            onChange={(e) => setFormData({ ...formData, headlines: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="Compassionate listener helping you find your way."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">About Me (Detailed)</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                            placeholder="Share your journey, approach, and what clients can expect..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TherapistLayout>
    );
}
