"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import DataTable, { Column, FilterConfig } from "@/components/admin/DataTable";

interface Transaction {
    id: number;
    created_at: string;
    status: string;
    amount_paid_in_inr: number;
    payment_reference: string;
    razorpay_payment_id: string;
    failure_reason: string;
    user_name: string;
    user_email: string;
    mentor_name: string;
    start_time: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/transactions");
            if (res.ok) {
                const json = await res.json();
                setTransactions(json.bookings || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function updateStatus(id: number, status: string) {
        if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
        setUpdating(id);
        try {
            const res = await fetch("/api/admin/transactions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: id, status })
            });
            if (res.ok) {
                fetchTransactions();
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(null);
        }
    }

    async function deleteTransaction(id: number) {
        if (!confirm("Are you sure you want to delete this pending transaction? This will release the slot.")) return;
        setUpdating(id);
        try {
            const res = await fetch(`/api/admin/transactions?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchTransactions();
            } else {
                alert("Failed to delete transaction");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(null);
        }
    }

    const columns: Column[] = [
        {
            key: "id",
            label: "ID",
            render: (val: any) => <span className="font-mono text-xs text-gray-500">#{val}</span>
        },
        {
            key: "user_name",
            label: "User",
            render: (_: any, row: Transaction) => (
                <div>
                    <div className="font-medium text-gray-900">{row.user_name}</div>
                    <div className="text-xs text-gray-500">{row.user_email}</div>
                </div>
            )
        },
        {
            key: "mentor_name",
            label: "Mentor / Slot",
            render: (_: any, row: Transaction) => (
                <div>
                    <div className="text-sm text-gray-900">{row.mentor_name}</div>
                    <div className="text-xs text-gray-500">
                        {row.start_time ? format(new Date(row.start_time), "MMM d, h:mm a") : "N/A"}
                    </div>
                </div>
            )
        },
        {
            key: "amount_paid_in_inr",
            label: "Payment Details",
            render: (_: any, row: Transaction) => (
                <div>
                    <div className="font-bold text-gray-900">₹{row.amount_paid_in_inr}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1" title="Order ID">{row.payment_reference || "-"}</div>
                    {row.razorpay_payment_id && (
                        <div className="text-xs text-green-600 font-mono" title="Payment ID">{row.razorpay_payment_id}</div>
                    )}
                    {row.failure_reason && (
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {row.failure_reason}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                    ${val === 'confirmed' ? 'bg-green-50 text-green-600' :
                        val === 'cancelled' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'}
                `}>
                    {val === 'confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                    {val === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                    {val === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {val}
                </span>
            )
        }
    ];

    const filters: FilterConfig[] = [
        {
            key: "status",
            label: "Status",
            options: [
                { value: "confirmed", label: "Confirmed" },
                { value: "pending", label: "Pending" },
                { value: "cancelled", label: "Cancelled" }
            ]
        }
    ];

    return (
        <div className="p-8">
            <DataTable
                title="Transactions"
                columns={columns}
                data={transactions}
                loading={loading}
                filters={filters}
                searchPlaceholder="Search user, order ID..."
                actions={(row: Transaction) => (
                    <div className="flex items-center justify-end gap-2">
                        {row.status !== 'confirmed' && (
                            <button
                                onClick={() => updateStatus(row.id, 'confirmed')}
                                disabled={updating === row.id}
                                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                                {updating === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                            </button>
                        )}
                        {row.status !== 'cancelled' && (
                            <button
                                onClick={() => updateStatus(row.id, 'cancelled')}
                                disabled={updating === row.id}
                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                {updating === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cancel"}
                            </button>
                        )}
                        {row.status === 'pending' && (
                            <button
                                onClick={() => deleteTransaction(row.id)}
                                disabled={updating === row.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete Transaction"
                            >
                                {updating === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}
            />
        </div>
    );
}
