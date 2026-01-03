"use client";

import { useEffect, useState } from "react";
import ScientificLoader from "@/components/ScientificLoader";
import { Check, X, MessageSquare, Star, Shield, AlertCircle } from "lucide-react";

interface Review {
    id: number;
    booking_id: number;
    user_name: string;
    mentor_name: string;
    rating: number;
    review_text: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function ReviewModerationPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch("/api/reviews?status=pending");
            if (res.ok) {
                setReviews(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (id: number, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            const res = await fetch("/api/admin/moderation/reviews", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                // Remove from list
                setReviews(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Moderation error", error);
            alert("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><ScientificLoader /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Moderation</h1>
                <p className="text-gray-600">Approve or reject user reviews.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            Pending Reviews
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Reviews waiting for approval</p>
                    </div>
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                        {reviews.length} Pending
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p>No pending reviews to moderate.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">by {review.user_name}</span>
                                            <span className="text-gray-400 text-sm.•">•</span>
                                            <span className="text-sm text-gray-500">for {review.mentor_name}</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                            &quot;{review.review_text}&quot;
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">Submitted on {new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-start gap-2">
                                        <button
                                            onClick={() => handleModeration(review.id, 'approved')}
                                            disabled={processingId === review.id}
                                            className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleModeration(review.id, 'rejected')}
                                            disabled={processingId === review.id}
                                            className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
