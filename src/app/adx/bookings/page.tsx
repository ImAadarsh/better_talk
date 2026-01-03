"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Calendar, User, Clock, X, FileText, MessageCircle,
    Link as LinkIcon, CheckCircle, Copy, ExternalLink, Bell
} from "lucide-react";
import ScientificLoader from "@/components/ScientificLoader";
import { format, parseISO } from "date-fns";

interface Booking {
    id: number;
    mentor_slot_id: number;
    user_name: string;
    user_image?: string;
    user_avatar?: string;
    mentor_name: string;
    mentor_image?: string;
    mentor_avatar?: string;
    start_time: string;
    end_time: string;
    plan_name: string;
    price: number;
    session_status: 'scheduled' | 'completed' | 'cancelled';
    joining_link?: string;
    has_notes?: number;
    chat_id?: number;
}

interface BookingDetails extends Booking {
    user_email: string;
    mentor_email: string;
    chat_window_days: number;
    chat_end_at?: string;
    chat_expired: boolean;
    created_at: string;
}

interface Message {
    id: number;
    message_text: string;
    sent_at: string;
    sender_name: string;
}

export default function AdminBookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [notes, setNotes] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [joiningLink, setJoiningLink] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/admin/bookings");
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookingDetails = async (bookingId: number) => {
        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}`);
            if (res.ok) {
                const details = await res.json();
                setSelectedBooking(details);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error("Error fetching booking details:", error);
        }
    };

    const fetchNotes = async (slotId: number) => {
        try {
            const res = await fetch(`/api/sessions/${slotId}/notes`);
            if (res.ok) {
                const data = await res.json();
                setNotes(data.notes_text || "No notes available");
            } else {
                setNotes("No notes available");
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes("Error loading notes");
        }
    };

    const fetchChatMessages = async (chatId: number) => {
        try {
            const res = await fetch(`/api/chats/${chatId}/messages`);
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const updateStatus = async (bookingId: number, status: string) => {
        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                fetchBookings();
                if (selectedBooking) {
                    fetchBookingDetails(bookingId);
                }
                alert("Status updated successfully");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const updateJoiningLink = async () => {
        if (!selectedBooking || !joiningLink.trim()) return;

        try {
            const res = await fetch(`/api/bookings/${selectedBooking.id}/joining-link`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joiningLink }),
            });

            if (res.ok) {
                setShowLinkModal(false);
                fetchBookings();
                fetchBookingDetails(selectedBooking.id);
                alert("Joining link updated successfully");
            }
        } catch (error) {
            console.error("Error updating link:", error);
        }
    };

    const notifyParticipants = async () => {
        if (!selectedBooking) return;
        if (!confirm("Send email notification to both User and Therapist?")) return;

        try {
            const res = await fetch(`/api/bookings/${selectedBooking.id}/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: 'notify_both' }),
            });

            if (res.ok) {
                alert("Notifications sent successfully");
            } else {
                alert("Failed to send notifications");
            }
        } catch (error) {
            console.error("Error sending notifications:", error);
        }
    };

    const openNotesModal = async (booking: Booking) => {
        setSelectedBooking(booking as BookingDetails);
        await fetchNotes(booking.mentor_slot_id);
        setShowNotesModal(true);
    };

    const openChatModal = async (booking: Booking) => {
        if (!booking.chat_id) return;
        setSelectedBooking(booking as BookingDetails);
        await fetchChatMessages(booking.chat_id);
        setShowChatModal(true);
    };

    const openLinkModal = (booking: BookingDetails) => {
        setSelectedBooking(booking);
        setJoiningLink(booking.joining_link || "");
        setShowLinkModal(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const filteredBookings = filterStatus === "all"
        ? bookings
        : bookings.filter(b => b.session_status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ScientificLoader />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
                <p className="text-gray-600">View and manage all session bookings</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === status
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Therapist</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        No bookings found for the selected filter.
                                    </td>
                                </tr>
                            ) : filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-400 text-xs">#{booking.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                {(booking.user_image || booking.user_avatar) ? (
                                                    <Image
                                                        src={booking.user_image || booking.user_avatar!}
                                                        alt={booking.user_name}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{booking.user_name || "Unknown Patient"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                {(booking.mentor_image || booking.mentor_avatar) ? (
                                                    <Image
                                                        src={booking.mentor_image || booking.mentor_avatar!}
                                                        alt={booking.mentor_name}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{booking.mentor_name || "Unknown Therapist"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.start_time ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(parseISO(booking.start_time), "MMM dd, yyyy")}</span>
                                                <Clock className="w-4 h-4 ml-2" />
                                                <span>{format(parseISO(booking.start_time), "h:mm a")}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 font-medium">Time not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">{booking.plan_name || "N/A"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.session_status)}`}>
                                            {booking.session_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchBookingDetails(booking.id)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                            >
                                                Details
                                            </button>
                                            {booking.has_notes ? (
                                                <button
                                                    onClick={() => openNotesModal(booking)}
                                                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                                                >
                                                    Notes
                                                </button>
                                            ) : null}
                                            {booking.chat_id && (
                                                <button
                                                    onClick={() => openChatModal(booking)}
                                                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                                                >
                                                    Chat
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={notifyParticipants}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-brand-primary"
                                    title="Notify Participants"
                                >
                                    <Bell className="w-5 h-5" />
                                </button>
                                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Session Info */}
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Session Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Booking ID</p>
                                        <p className="font-semibold text-gray-900">#{selectedBooking.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Plan</p>
                                        <p className="font-semibold text-gray-900">{selectedBooking.plan_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-semibold text-gray-900">{format(parseISO(selectedBooking.start_time), "MMM dd, yyyy")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Time</p>
                                        <p className="font-semibold text-gray-900">
                                            {format(parseISO(selectedBooking.start_time), "h:mm a")} - {format(parseISO(selectedBooking.end_time), "h:mm a")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="font-semibold text-gray-900">₹{selectedBooking.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <select
                                            value={selectedBooking.session_status}
                                            onChange={(e) => updateStatus(selectedBooking.id, e.target.value)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 font-semibold text-sm"
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="bg-blue-50 rounded-2xl p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Patient Information</h4>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                        {(selectedBooking.user_image || selectedBooking.user_avatar) ? (
                                            <Image
                                                src={selectedBooking.user_image || selectedBooking.user_avatar!}
                                                alt={selectedBooking.user_name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">{selectedBooking.user_name}</p>
                                        <p className="text-sm text-gray-600">{selectedBooking.user_email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Therapist Info */}
                            <div className="bg-purple-50 rounded-2xl p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Therapist Information</h4>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                        {(selectedBooking.mentor_image || selectedBooking.mentor_avatar) ? (
                                            <Image
                                                src={selectedBooking.mentor_image || selectedBooking.mentor_avatar!}
                                                alt={selectedBooking.mentor_name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">{selectedBooking.mentor_name}</p>
                                        <p className="text-sm text-gray-600">{selectedBooking.mentor_email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Joining Link */}
                            <div className="bg-green-50 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">Joining Link</h4>
                                    <button
                                        onClick={() => openLinkModal(selectedBooking)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                                {selectedBooking.joining_link ? (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={selectedBooking.joining_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-sm text-blue-600 hover:underline truncate"
                                        >
                                            {selectedBooking.joining_link}
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(selectedBooking.joining_link!)}
                                            className="p-2 hover:bg-green-100 rounded-lg"
                                        >
                                            <Copy className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <a
                                            href={selectedBooking.joining_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-green-100 rounded-lg"
                                        >
                                            <ExternalLink className="w-4 h-4 text-gray-600" />
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No joining link added</p>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3">
                                {selectedBooking.has_notes ? (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            openNotesModal(selectedBooking as Booking);
                                        }}
                                        className="flex-1 px-6 py-3 bg-purple-50 text-purple-700 font-medium rounded-xl hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Notes
                                    </button>
                                ) : null}
                                {selectedBooking.chat_id && (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            openChatModal(selectedBooking as Booking);
                                        }}
                                        className="flex-1 px-6 py-3 bg-green-50 text-green-700 font-medium rounded-xl hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        View Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotesModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Session Notes</h3>
                            <button onClick={() => setShowNotesModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {showChatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowChatModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Chat Messages</h3>
                            <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto space-y-3">
                            {messages.length === 0 ? (
                                <p className="text-center text-gray-500">No messages yet</p>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-gray-900">{msg.sender_name}</span>
                                            <span className="text-xs text-gray-500">{format(parseISO(msg.sent_at), "MMM dd, h:mm a")}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{msg.message_text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Joining Link Modal */}
            {showLinkModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Edit Joining Link</h3>
                            <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <input
                            type="url"
                            value={joiningLink}
                            onChange={(e) => setJoiningLink(e.target.value)}
                            placeholder="https://meet.google.com/..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={updateJoiningLink}
                                disabled={!joiningLink.trim()}
                                className="flex-1 px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                            >
                                Save Link
                            </button>
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
