"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import {
    User, Mail, Calendar, MessageSquare, Phone, Clock,
    ArrowLeft, Shield, Ban, Stethoscope, IndianRupee,
    CheckCircle, MessageCircle, Info
} from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";

export default function UserDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/admin/users/${id}`);
                const result = await res.json();
                if (result.error) throw new Error(result.error);
                setData(result);
            } catch (error) {
                console.error("Error fetching user details:", error);
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
            key: "therapist",
            label: "Therapist",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden border border-blue-100 shadow-sm shrink-0">
                        {row.therapist_image || row.therapist_avatar ? (
                            <Image
                                src={row.therapist_image || row.therapist_avatar}
                                alt={val}
                                width={32} // 8 * 4
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized={!(row.therapist_image?.startsWith('http') || row.therapist_avatar?.startsWith('http'))}
                            />
                        ) : (
                            <Stethoscope className="w-4 h-4" />
                        )}
                    </div>
                    <span className="font-bold text-gray-700">{val}</span>
                </div>
            )
        },
        {
            key: "session_start_at",
            label: "Schedule",
            render: (val: string) => {
                if (!val) return <span className="text-gray-400">Not set</span>;
                const d = new Date(val);
                return (
                    <div>
                        <div className="text-gray-900 font-bold">{d.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400 font-medium">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                );
            }
        },
        {
            key: "amount",
            label: "Paid",
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

    const messageColumns = [
        {
            key: "subject",
            label: "Subject",
            render: (val: string) => <span className="font-bold text-gray-900">{val}</span>
        },
        {
            key: "message",
            label: "Content",
            render: (val: string) => (
                <p className="text-sm text-gray-500 max-w-md truncate">{val}</p>
            )
        },
        {
            key: "created_at",
            label: "Date",
            render: (val: string) => <span className="text-gray-400 text-xs font-medium">{new Date(val).toLocaleDateString()}</span>
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <ScientificLoader />
            </div>
        );
    }

    if (!data || !data.user) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <Info className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">User not found</h3>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold hover:underline">Back to Users</button>
            </div>
        );
    }

    const { user, bookings, messages, chats } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Details</h1>
                        <p className="text-gray-500 font-medium">Viewing full activity history for {user.name}.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-gray-900 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-gray-900/20 overflow-hidden">
                                {user.image || user.avatar_url ? (
                                    <Image
                                        src={user.image || user.avatar_url}
                                        alt={user.name}
                                        width={96} // 24 * 4
                                        height={96}
                                        className="w-full h-full object-cover"
                                        unoptimized={!(user.image?.startsWith('http') || user.avatar_url?.startsWith('http'))}
                                    />
                                ) : (
                                    user.name?.charAt(0)
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mx-auto mt-2 uppercase tracking-widest">{user.role}</p>
                        </div>

                        <div className="mt-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-gray-900">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-bold text-gray-900">{user.phone_number || "Not provided"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined On</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-2xl ${user.status === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {user.status === 1 ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                    <span className="text-xs font-bold uppercase tracking-widest">{user.status === 1 ? "Active Account" : "Suspended"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bookings</p>
                            <p className="text-2xl font-extrabold text-gray-900 mt-1">{bookings.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Messages</p>
                            <p className="text-2xl font-extrabold text-gray-900 mt-1">{messages.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bookings Table */}
                    <DataTable
                        title="Booking History"
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

                    {/* Messages Table */}
                    <DataTable
                        title="Contact Form Inquiries"
                        columns={messageColumns}
                        data={messages}
                    />

                    {/* Chat Sessions */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-none">Recent Chat Sessions</h3>
                        </div>

                        <div className="space-y-4">
                            {chats.length > 0 ? chats.map((chat: any) => (
                                <div key={chat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-violet-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm border border-gray-100">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Session #{chat.id}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(chat.chat_start_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-900">{chat.message_count} Messages</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${chat.is_active ? 'text-green-500' : 'text-gray-400'}`}>
                                            {chat.is_active ? 'Ongoing' : 'Closed'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 font-medium">No chat history discovered.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
