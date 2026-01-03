"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, User, Calendar, Edit2, Check, X, Users, ArrowRight, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
    id: number;
    email: string;
    anonymous_username: string;
    age: number;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    role: string;
}

interface Group {
    id: number;
    name: string;
    description: string;
    member_count: number;
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [activeTab, setActiveTab] = useState<"about" | "groups">("about");

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ age: "", bio: "" });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setMyGroups(data.groups);

                    setEditForm({ age: data.user.age?.toString() || "", bio: data.user.bio || "" });
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio: editForm.bio, age: parseInt(editForm.age) }),
            });

            if (res.ok) {
                setUser((prev) => prev ? ({ ...prev, bio: editForm.bio, age: parseInt(editForm.age) }) : null);
                setIsEditingProfile(false);

            }
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setSavingProfile(false);
        }
    };

    // ... (rest of render)

    // Update the header part:
    // This replace block is tricky. I need to target the header area specifically. 
    // I will replace the Profile Header section.

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="w-full space-y-8 animate-fade-in">
                {/* Profile Header */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-soft-clay/30 flex flex-col md:flex-row items-center md:items-start gap-8 relative">
                    <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-brand-primary transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-brand-bg shadow-lg flex-shrink-0 bg-gray-100">
                        {user.avatar_url ? (
                            <Image src={user.avatar_url} alt="Profile" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary text-3xl font-bold">
                                {user.anonymous_username[0]}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900">{user.anonymous_username}</h1>

                        {isEditingProfile ? (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 max-w-lg">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</label>
                                    <input
                                        type="number"
                                        value={editForm.age}
                                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                        className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:border-brand-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:border-brand-primary outline-none min-h-[100px]"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setIsEditingProfile(false)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile}
                                        style={{ background: 'linear-gradient(90deg, #003b79, #0754a4, #3986d9, #38c4f2)' }}
                                        className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all shadow-md shadow-blue-500/20"
                                    >
                                        {savingProfile ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1 bg-brand-secondary/50 text-brand-text px-3 py-1 rounded-full">
                                    <User className="w-4 h-4" /> Age: {user.age}
                                </span>
                                <span className="flex items-center gap-1 bg-brand-secondary/50 text-brand-text px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4" /> Joined: {new Date(user.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                                </span>
                                <span className="flex items-center gap-1 bg-brand-secondary/50 text-brand-text px-3 py-1 rounded-full capitalize">
                                    {user.role}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-soft-clay/30">
                    <button
                        onClick={() => setActiveTab("about")}
                        className={`px-8 py-4 font-medium text-sm transition-colors relative ${activeTab === "about" ? "text-forest-green" : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        About Me
                        {activeTab === "about" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-forest-green rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("groups")}
                        className={`px-8 py-4 font-medium text-sm transition-colors relative ${activeTab === "groups" ? "text-forest-green" : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        My Communities
                        {activeTab === "groups" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-forest-green rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-soft-clay/30 min-h-[300px]">
                    {activeTab === "about" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Bio</h2>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed">
                                {user.bio || "No bio added yet."}
                            </div>
                        </div>
                    )}

                    {activeTab === "groups" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Joined Groups</h2>
                            {myGroups.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    You haven&apos;t joined any groups yet.
                                    <br />
                                    <Link href="/groups" className="text-forest-green hover:underline mt-2 inline-block">
                                        Explore Communities
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myGroups.map((group) => (
                                        <div key={group.id} className="border border-soft-clay/30 p-4 rounded-xl hover:shadow-md transition-all bg-warm-sand/20">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                                                <span className="text-xs font-medium bg-soft-clay/30 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {group.member_count}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{group.description}</p>
                                            <Link
                                                href={`/groups/${group.id}`}
                                                className="text-sm font-medium text-forest-green flex items-center gap-1 hover:gap-2 transition-all"
                                            >
                                                Visit Group <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
