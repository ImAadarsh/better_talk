"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, Users, Activity, Star } from "lucide-react";
import Link from "next/link";
import ScientificLoader from "@/components/ScientificLoader";

interface Therapist {
    id: number;
    name: string;
    designation: string;
    headlines: string;
    patients_treated: number;
    image?: string;
    avatar_url?: string;
    average_rating: string | number;
}

export default function TherapistsPage() {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTherapists() {
            try {
                const res = await fetch("/api/therapist/list");
                if (res.ok) {
                    setTherapists(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch therapists", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTherapists();
    }, []);

    return (
        <DashboardLayout>
            <div className="w-full px-4 md:px-8 py-8 pb-32">
                <div className="mb-6 md:mb-10 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Find Your Therapist</h1>
                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mt-1">
                        Connect with verified professionals who can help you navigate life&apos;s challenges.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <ScientificLoader />
                    </div>
                ) : therapists.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No therapists found</h3>
                        <p className="text-gray-500">Check back soon as we are onboarding new professionals.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {therapists.map((therapist) => (
                            <div key={therapist.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all">
                                            {therapist.image || therapist.avatar_url ? (
                                                <Image
                                                    src={therapist.image || therapist.avatar_url || ""}
                                                    alt={therapist.name}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                            <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500 text-white" />
                                        </div>
                                    </div>
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        Verified
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {therapist.name}
                                    </h3>
                                    <p className="text-gray-500 font-medium text-sm mb-3">{therapist.designation}</p>
                                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed h-[42px]">
                                        {therapist.headlines}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 mb-6 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <Activity className="w-4 h-4 text-forest-green" />
                                        <span className="text-sm font-bold text-gray-900">{therapist.patients_treated}+</span>
                                        <span className="text-xs text-gray-400 font-medium">Patients</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-bold text-gray-900">
                                            {Number(therapist.average_rating) > 0 ? Number(therapist.average_rating).toFixed(1) : "New"}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">Rating</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/therapist/${therapist.id}`}
                                    style={{ background: 'linear-gradient(90deg, #003b79, #0754a4, #3986d9, #38c4f2)' }}
                                    className="block w-full text-white text-center font-medium py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Book Session
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
