"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Clock, ArrowLeft, User } from "lucide-react";
import { format, parseISO, differenceInSeconds } from "date-fns";
import Image from "next/image";
import ScientificLoader from "@/components/ScientificLoader";

interface Message {
    id: number;
    message_text: string;
    sent_at: string;
    sender_id: number;
    sender_name: string;
    sender_image?: string;
}

interface ChatDetails {
    id: number;
    chat_end_at: string;
    other_party_name: string;
    other_party_image?: string;
    isExpired: boolean;
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const [chat, setChat] = useState<ChatDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatId = params.id as string;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await fetch("/api/user/me");
            if (res.ok) {
                const data = await res.json();
                setCurrentUserId(data.id);
            }
        } catch (error) {
            console.error("Failed to fetch current user", error);
        }
    }, []);

    const fetchChatDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/chats/${chatId}`);
            if (res.ok) {
                setChat(await res.json());
            } else {
                router.push("/sessions");
            }
        } catch (error) {
            console.error("Failed to fetch chat details", error);
        } finally {
            setLoading(false);
        }
    }, [chatId, router]);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/chats/${chatId}/messages`);
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    }, [chatId]);

    useEffect(() => {
        fetchChatDetails();
        fetchMessages();
        fetchCurrentUser();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [chatId, fetchChatDetails, fetchMessages, fetchCurrentUser]);

    useEffect(() => {
        if (chat && !chat.isExpired) {
            const interval = setInterval(() => {
                const seconds = differenceInSeconds(parseISO(chat.chat_end_at), new Date());
                setTimeRemaining(seconds > 0 ? seconds : 0);

                if (seconds <= 0) {
                    setChat(prev => prev ? { ...prev, isExpired: true } : null);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [chat]);


    const sendMessage = async () => {
        if (!newMessage.trim() || sending || chat?.isExpired) return;

        setSending(true);
        try {
            const res = await fetch(`/api/chats/${chatId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                const message = await res.json();
                setMessages(prev => [...prev, message]);
                setNewMessage("");
            } else if (res.status === 410) {
                alert("Chat window has expired");
                setChat(prev => prev ? { ...prev, isExpired: true } : null);
            }
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };



    const formatTime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) return `${days}d ${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <ScientificLoader />
            </div>
        );
    }

    if (!chat) return null;

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {chat.other_party_image ? (
                            <Image src={chat.other_party_image} alt={chat.other_party_name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{chat.other_party_name}</h2>
                        <p className="text-xs text-gray-500">Session Chat</p>
                    </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${chat.isExpired ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {chat.isExpired ? "Expired" : formatTime(timeRemaining)}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isMe ? 'bg-brand-primary text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow-sm`}>
                                    {!isMe && (
                                        <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message_text}</p>
                                    <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {format(parseISO(msg.sent_at), "h:mm a")}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Sticky Footer Input */}
            {chat.isExpired ? (
                <div className="sticky bottom-0 bg-red-50 border-t border-red-200 p-4 text-center">
                    <p className="text-red-700 font-medium">Chat window has expired</p>
                    <p className="text-red-600 text-sm">You can no longer send messages in this chat.</p>
                </div>
            ) : (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                    <div className="flex gap-2 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            disabled={sending}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                            className="px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
