"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, Clock, Video, User, MoreVertical, FileText, MessageCircle, X } from "lucide-react";
import { format, isPast, parseISO, addDays, differenceInSeconds } from "date-fns";
import ScientificLoader from "@/components/ScientificLoader";

interface Session {
    id: number;
    start_time: string;
    end_time: string;
    other_party_name: string;
    other_party_image?: string;
    other_party_role: string;
    joining_link?: string;
    session_status?: 'scheduled' | 'completed';
    booking_id?: number;
    chat_window_days?: number;
    has_notes?: number;
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedSessionNotes, setSelectedSessionNotes] = useState<string | null>(null);
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await fetch("/api/sessions");
                if (res.ok) {
                    setSessions(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch sessions", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSessions();
    }, []);

    const fetchNotes = async (slotId: number) => {
        setLoadingNotes(true);
        try {
            const res = await fetch(`/api/sessions/${slotId}/notes`);
            if (res.ok) {
                const data = await res.json();
                setSelectedSessionNotes(data.notes_text || "No notes available for this session.");
                setShowNotesModal(true);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleOpenChat = async (bookingId: number) => {
        try {
            const res = await fetch("/api/chats/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId }),
            });
            if (res.ok) {
                const { chatId } = await res.json();
                window.location.href = `/sessions/${chatId}/chat`;
            }
        } catch (error) {
            console.error("Failed to create chat", error);
        }
    };

    const getChatTimeRemaining = (endTime: string, chatWindowDays: number) => {
        const chatEndDate = addDays(parseISO(endTime), chatWindowDays);
        const now = new Date();
        if (now > chatEndDate) return null;

        const seconds = differenceInSeconds(chatEndDate, now);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h left`;
        return "Expires soon";
    };

    // Sessions are completed if: session_status is 'completed' OR end_time has passed
    const upcomingSessions = sessions.filter(s =>
        s.session_status !== 'completed' && !isPast(parseISO(s.end_time))
    );
    const pastSessions = sessions.filter(s =>
        s.session_status === 'completed' || isPast(parseISO(s.end_time))
    ).reverse();

    const displayedSessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
                        <p className="text-gray-600">Manage your scheduled therapy sessions.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'past'
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Past History
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <ScientificLoader />
                    </div>
                ) : displayedSessions.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No {activeTab} sessions</h3>
                        <p className="text-gray-500">
                            {activeTab === 'upcoming'
                                ? "You don't have any sessions scheduled."
                                : "No past session history found."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {displayedSessions.map((session) => (
                            <div key={session.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center">
                                {/* Date/Time Box */}
                                <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-xl p-4 w-full md:w-32 shrink-0">
                                    <span className="text-xs font-bold uppercase tracking-wider mb-1">
                                        {format(parseISO(session.start_time), "MMM")}
                                    </span>
                                    <span className="text-3xl font-bold leading-none mb-1">
                                        {format(parseISO(session.start_time), "dd")}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {format(parseISO(session.start_time), "EEE")}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 font-medium text-gray-500 text-sm">
                                        <div className="flex items-center justify-center md:justify-start gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {format(parseISO(session.start_time), "h:mm a")} - {format(parseISO(session.end_time), "h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">One-on-One Session</h3>
                                    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                            {session.other_party_image ? (
                                                <Image src={session.other_party_image} alt={session.other_party_name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{session.other_party_name}</p>
                                            <p className="text-xs text-gray-500">{session.other_party_role}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full md:w-auto flex flex-col gap-2">
                                    {activeTab === 'upcoming' ? (
                                        session.joining_link ? (
                                            <a
                                                href={session.joining_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full md:w-auto px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join Meeting
                                            </a>
                                        ) : (
                                            <div className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl flex items-center justify-center gap-2 text-sm">
                                                <Clock className="w-4 h-4" />
                                                Link pending
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {session.has_notes === 1 && (
                                                <button
                                                    onClick={() => fetchNotes(session.id)}
                                                    disabled={loadingNotes}
                                                    className="w-full md:w-auto px-6 py-3 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View Notes
                                                </button>
                                            )}
                                            {session.booking_id && session.chat_window_days !== undefined && (
                                                <button
                                                    onClick={() => handleOpenChat(session.booking_id!)}
                                                    disabled={!getChatTimeRemaining(session.end_time, session.chat_window_days)}
                                                    className="w-full md:w-auto px-6 py-3 bg-green-50 text-green-700 font-medium rounded-xl hover:bg-green-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    {getChatTimeRemaining(session.end_time, session.chat_window_days) || "Chat Expired"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
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
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedSessionNotes}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
