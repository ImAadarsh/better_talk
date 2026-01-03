"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DataTable from "@/components/admin/DataTable";
import { Calendar, User, Stethoscope, IndianRupee, Clock, ArrowRight, MoreHorizontal } from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";

export default function BookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("/api/admin/bookings");
                const data = await res.json();
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const columns = [
        {
            key: "id",
            label: "Booking ID",
            render: (val: string) => (
                <span className="font-bold text-gray-400 text-xs">#{val}</span>
            )
        },
        {
            key: "user",
            label: "Patient",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-100/50 shadow-sm shrink-0">
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
                    <span className="font-bold text-gray-700">{val}</span>
                </div>
            )
        },
        {
            key: "therapist",
            label: "Therapist",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden border border-blue-100/50 shadow-sm shrink-0">
                        {row.therapist_image || row.therapist_avatar ? (
                            <Image
                                src={row.therapist_image || row.therapist_avatar}
                                alt={val}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
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
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[val as keyof typeof colors]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${val === "confirmed" ? "bg-green-500" : val === "pending" ? "bg-amber-500" : "bg-red-500"}`}></span>
                        {val}
                    </div>
                );
            }
        }
    ];

    const actions = (row: any) => (
        <button className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-gray-900 hover:shadow-sm">
            <MoreHorizontal className="w-5 h-5" />
        </button>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <ScientificLoader />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Booking Monitor</h1>
                <p className="text-gray-500 font-medium">Tracking all session activities and platform revenue.</p>
            </div>

            <DataTable
                title="Consolidated Transactions"
                columns={columns}
                data={bookings}
                actions={actions}
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
    );
}
