"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, CheckCircle, MapPin, Calendar, Clock, ChevronLeft, ChevronRight, Star, Activity, ShieldCheck, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ScientificLoader from "@/components/ScientificLoader";
import { format, addDays, isSameDay, parseISO } from "date-fns";

interface Plan {
    id: number;
    price_in_inr: number;
    session_duration_min: string;
    chat_window_days: number;
}

interface Therapist {
    id: number;
    name: string;
    designation: string;
    headlines: string;
    patients_treated: number;
    image?: string;
    experience_start_date: string;
}

interface Slot {
    id: number;
    start_time: string;
    end_time: string;
    price_in_inr: number;
    session_duration_min: string;
}

export default function TherapistProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [booking, setBooking] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/therapist/${params.id}`);
                if (res.ok) {
                    const json = await res.json();
                    setTherapist(json.mentor);
                    setSlots(json.slots);
                    setPlans(json.plans || []);
                } else {
                    router.push("/therapists");
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) fetchData();
    }, [params.id, router]);

    // Derived unique dates from available slots
    const uniqueDateStrings = Array.from(new Set(slots.map(slot => format(parseISO(slot.start_time), 'yyyy-MM-dd')))).sort();
    const dates = uniqueDateStrings.map(dateStr => parseISO(dateStr));

    // Filter slots for selected date
    const daySlots = slots.filter(slot => isSameDay(parseISO(slot.start_time), selectedDate));

    const handleBookSlot = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        try {
            const res = await fetch("/api/therapist/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId: selectedSlot.id }),
            });

            if (res.ok) {
                setShowModal(false);
                router.push(`/sessions/success?therapist=${encodeURIComponent(therapist?.name || "your therapist")}`);
            } else {
                alert("Failed to book slot. It might have been taken.");
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[80vh]">
                    <ScientificLoader />
                </div>
            </DashboardLayout>
        );
    }

    if (!therapist) return null;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative shrink-0 mx-auto md:mx-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-gray-50 bg-gray-100">
                            {therapist.image ? (
                                <Image src={therapist.image} alt={therapist.name} width={160} height={160} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ShieldCheck className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                            <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                            <h1 className="text-3xl font-bold text-gray-900">{therapist.name}</h1>
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide w-fit mx-auto md:mx-0">
                                Verified Therapist
                            </span>
                        </div>
                        <p className="text-lg text-gray-600 font-medium mb-4">{therapist.designation}</p>
                        <p className="text-gray-500 max-w-2xl leading-relaxed mb-6 mx-auto md:mx-0">{therapist.headlines}</p>

                        <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xl font-bold text-gray-900">{therapist.patients_treated}+</p>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Patients</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xl font-bold text-gray-900">4.9</p>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Rating</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xl font-bold text-gray-900">5+ Yrs</p>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Experience</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Date Selection - Left Col */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-brand-primary" />
                                Select Date
                            </h2>
                            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
                                {dates.map((date) => {
                                    const isSelected = isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={`shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border snap-start ${isSelected
                                                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                                                : "bg-white text-gray-600 border-gray-100 hover:border-brand-primary/30 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className="text-xs font-medium uppercase">{format(date, "EEE")}</span>
                                            <span className="text-2xl font-bold">{format(date, "d")}</span>
                                            <span className="text-[10px] opacity-80">{format(date, "MMM")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[300px]">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-brand-primary" />
                                Available Slots
                            </h2>
                            {daySlots.length === 0 ? (
                                <div className="flcc h-40 text-gray-400 italic">
                                    No slots available for this date.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {daySlots.map(slot => (
                                        <button
                                            key={slot.id}
                                            onClick={() => {
                                                setSelectedSlot(slot);
                                                setShowModal(true);
                                            }}
                                            className="py-3 px-4 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-700 font-semibold hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm active:scale-95"
                                        >
                                            {format(parseISO(slot.start_time), "h:mm a")}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary / Confirmation - Right Col (Desktop) */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
                            <h3 className="font-bold text-gray-900 mb-4">Programming Session</h3>
                            <ul className="space-y-4 text-sm text-gray-600 mb-6">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span>One-on-One Session</span>
                                </li>
                                {selectedSlot ? (
                                    <>
                                        <li className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span>{selectedSlot.session_duration_min} Minutes Duration</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <span>{selectedSlot.price_in_inr} INR / Session</span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span>{plans.length > 0 ? plans.map(p => p.session_duration_min).join('/') : '60'} Minutes</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <span>Starts from INR {plans.length > 0 ? Math.min(...plans.map(p => p.price_in_inr)) : '0'}</span>
                                        </li>
                                    </>
                                )}
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span>Confidential & Secure</span>
                                </li>
                            </ul>
                            <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed">
                                Please select a slot to proceed with booking. A confirmation will be sent to your registered email.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showModal && selectedSlot && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl scale-100 animate-scale-up">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Booking</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to book a session with <span className="font-semibold text-gray-900">{therapist.name}</span> on:
                            </p>

                            <div className="bg-brand-primary/5 rounded-2xl p-4 mb-8 border border-brand-primary/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-brand-primary" />
                                    <span className="font-medium text-gray-900">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-brand-primary" />
                                    <span className="font-medium text-gray-900">
                                        {format(parseISO(selectedSlot.start_time), "h:mm a")} - {format(parseISO(selectedSlot.end_time), "h:mm a")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-brand-primary/10">
                                    <Activity className="w-5 h-5 text-brand-primary" />
                                    <span className="font-bold text-gray-900">Price: ₹{selectedSlot.price_in_inr}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBookSlot}
                                    disabled={booking}
                                    className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25"
                                >
                                    {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

