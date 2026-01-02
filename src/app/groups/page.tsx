"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Loader2, ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

interface Group {
    id: number;
    name: string;
    description: string;
    slug: string;
    member_count: number;
    is_member: number;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroups() {
            try {
                const res = await fetch("/api/groups/list");
                if (res.ok) {
                    const data = await res.json();
                    setGroups(data);
                }
            } catch (error) {
                console.error("Failed to fetch groups", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Communities</h1>
                        <p className="text-gray-500 mt-2 text-lg">Find your safe space to share and grow.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-forest-green animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {groups.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-soft-clay">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No active groups found.</p>
                            </div>
                        ) : (
                            groups.map((group) => {
                                const isJoined = group.is_member > 0;
                                return (
                                    <div
                                        key={group.id}
                                        className={`relative group backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${group.is_member
                                            ? "bg-brand-primary border-2 border-brand-primary shadow-[0_8px_30px_-6px_rgba(52,198,244,0.4)]"
                                            : "bg-white/80 border border-brand-border hover:shadow-xl hover:shadow-brand-primary/10"
                                            }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 rounded-2xl ${group.is_member
                                            ? "from-brand-primary/5 to-transparent opacity-100"
                                            : "group-hover:opacity-100 from-brand-secondary/30 to-transparent"
                                            }`} />       {isJoined && (
                                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                            )}

                                        <div className="p-8 flex flex-col h-full relative z-10">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isJoined ? "bg-white/20 text-white backdrop-blur-md" : "bg-forest-green/5 text-forest-green"
                                                    }`}>
                                                    <Users className="w-7 h-7" />
                                                </div>
                                                {isJoined && (
                                                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                        <Check className="w-3 h-3" /> Joined
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className={`text-2xl font-bold mb-3 tracking-tight ${isJoined ? "text-white" : "text-gray-900"}`}>
                                                {group.name}
                                            </h3>

                                            <p className={`text-sm leading-relaxed line-clamp-3 mb-8 flex-1 font-medium ${isJoined ? "text-white/80" : "text-gray-500"}`}>
                                                {group.description}
                                            </p>

                                            <div className={`pt-6 flex items-center justify-between mt-auto border-t ${isJoined ? "border-white/10" : "border-gray-100"
                                                }`}>
                                                <span className={`text-sm font-semibold ${isJoined ? "text-white/90" : "text-gray-500"}`}>
                                                    {group.member_count} members
                                                </span>

                                                <Link
                                                    href={`/groups/${group.id}`}
                                                    className={`flex items-center gap-2 text-sm font-bold transition-all group-hover:translate-x-1 ${isJoined ? "text-white" : "text-forest-green"
                                                        }`}
                                                >
                                                    {isJoined ? "Open Group" : "Join Now"}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
