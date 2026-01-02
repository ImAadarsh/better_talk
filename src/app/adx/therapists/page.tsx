"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { Stethoscope, CheckCircle, XCircle, MoreVertical, Eye, BadgeCheck, Clock } from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";

export default function TherapistsPage() {
    const [loading, setLoading] = useState(true);
    const [therapists, setTherapists] = useState([]);

    useEffect(() => {
        const fetchTherapists = async () => {
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

        fetchTherapists();
    }, []);

    // Rename users to therapists for clarity
    const setUsers = setTherapists as any;

    const columns = [
        {
            key: "name",
            label: "Therapist Detail",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                        {val.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{val}</span>
                            {row.is_verified === 1 && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">{row.designation}</div>
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
            render: (val: number) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${val === 1 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {val === 1 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {val === 1 ? "Verified" : "Pending"}
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
        <div className="flex items-center justify-end gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all hover:shadow-sm">
                <Eye className="w-4 h-4" />
                Review
            </button>
            {row.is_verified === 0 && (
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10">
                    <BadgeCheck className="w-4 h-4" />
                    Approve
                </button>
            )}
        </div>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Therapist Verification</h1>
                    <p className="text-gray-500 font-medium">Onboard and manage professional therapist credentials.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-sm font-bold text-gray-600">2 Pending Reviews</span>
                    </div>
                </div>
            </div>

            <DataTable
                title="Application List"
                columns={columns}
                data={therapists}
                actions={actions}
            />
        </div>
    );
}
