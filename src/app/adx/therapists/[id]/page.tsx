"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import {
    User, Mail, Calendar, MessageSquare, Phone, Clock,
    ArrowLeft, Shield, Ban, Stethoscope, IndianRupee,
    CheckCircle, MessageCircle, Info, Star, Briefcase, BadgeCheck
} from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";

export default function TherapistDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/admin/therapists/${id}`);
                const result = await res.json();

                // Fetch bookings for this therapist specifically
                const bookingsRes = await fetch(`/api/admin/bookings?mentor_id=${id}`);
                const bData = await bookingsRes.json();

                setData({
                    ...result,
                    bookings: Array.isArray(bData) ? bData : []
                });
            } catch (error) {
                console.error("Error fetching therapist details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    const bookingColumns = [
        {
            key: "id",
            label: "Booking ID",
            render: (val: string) => <span className="font-bold text-gray-400 text-xs">#{val}</span>
        },
        {
            key: "user",
            label: "Patient",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-100 ring-2 ring-white">
                        {row.user_image || row.user_avatar ? (
                            <Image
                                src={row.user_image || row.user_avatar}
                                alt={val}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized={!(row.user_image?.startsWith('http') || row.user_avatar?.startsWith('http'))}
                            />
                        ) : (
                            val.charAt(0)
                        )}
                    </div>
                    <span className="font-bold text-gray-900">{val}</span>
                </div>
            )
        },
        {
            key: "date",
            label: "Schedule",
            render: (val: string, row: any) => (
                <div>
                    <div className="text-gray-900 font-bold">{val}</div>
                    <div className="text-xs text-gray-400 font-medium">{row.time}</div>
                </div>
            )
        },
        {
            key: "amount",
            label: "Revenue",
            render: (val: number) => (
                <div className="flex items-center gap-1 font-extrabold text-gray-900">
                    <IndianRupee className="w-3 h-3 text-gray-400" />
                    {val.toLocaleString()}
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => {
                const colors = {
                    confirmed: "bg-green-50 text-green-700",
                    pending: "bg-amber-50 text-amber-700",
                    cancelled: "bg-red-50 text-red-700",
                };
                return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[val as keyof typeof colors] || "bg-gray-50 text-gray-600"}`}>
                        {val}
                    </div>
                );
            }
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <ScientificLoader />
            </div>
        );
    }

    if (!data || !data.therapist) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <Info className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Therapist Profile Not Found</h3>
                <button onClick={() => window.history.back()} className="mt-4 text-blue-600 font-bold hover:underline">Return to List</button>
            </div>
        );
    }

    const { therapist, bookings } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Therapist Audit</h1>
                        <p className="text-gray-500 font-medium">Reviewing professional history and patient reach for Dr. {therapist.name}.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-gray-900 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-gray-900/20 overflow-hidden relative group">
                                {therapist.image || therapist.avatar_url ? (
                                    <Image
                                        src={therapist.image || therapist.avatar_url}
                                        alt={therapist.name}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                        unoptimized={!(therapist.image?.startsWith('http') || therapist.avatar_url?.startsWith('http'))}
                                    />
                                ) : (
                                    <Stethoscope className="w-10 h-10 text-gray-400" />
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all font-bold tracking-tighter uppercase">
                                    {therapist.id}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{therapist.name}</h2>
                                {therapist.is_verified === 1 && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500 text-white" />}
                            </div>
                            <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mx-auto mt-2 uppercase tracking-widest">{therapist.designation || "Mentors"}</p>
                        </div>

                        <div className="mt-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinician Email</p>
                                    <p className="text-sm font-bold text-gray-900">{therapist.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                                    <p className="text-sm font-bold text-gray-900">{therapist.experience_years} Years Experience</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Tenure</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(therapist.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl ${therapist.status === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {therapist.status === 1 ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                    <span className="text-xs font-bold uppercase tracking-widest">{therapist.status === 1 ? "Verified Professional" : "Account Suspended"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bookings</p>
                            <p className="text-2xl font-extrabold text-gray-900 mt-1">{bookings.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Treated</p>
                            <p className="text-2xl font-extrabold text-gray-900 mt-1">{therapist.patients_treated}+</p>
                        </div>
                    </div>
                </div>

                {/* Main History */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-none">Professional Bio</h3>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
                            {therapist.bio || "No professional biography provided yet."}
                        </p>
                    </div>

                    <DataTable
                        title="Session History"
                        columns={bookingColumns}
                        data={bookings}
                        filters={[
                            {
                                key: "status",
                                label: "Booking Status",
                                options: [
                                    { value: "confirmed", label: "Confirmed" },
                                    { value: "pending", label: "Pending" },
                                    { value: "cancelled", label: "Cancelled" }
                                ]
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

