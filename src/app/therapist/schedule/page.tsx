"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { format, addMinutes, parse, isBefore, startOfDay } from "date-fns";
import { Calendar, Clock, Loader2, Save, CheckCircle, Plus, Trash2, ChevronDown } from "lucide-react";
import TherapistLayout from "@/components/TherapistLayout";

// Helper to generate slots
const generateSlots = (dateStr: string, startStr: string, endStr: string, duration: number) => {
    const slots = [];
    let current = parse(`${dateStr} ${startStr}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = parse(`${dateStr} ${endStr}`, 'yyyy-MM-dd HH:mm', new Date());

    while (isBefore(current, end)) {
        const next = addMinutes(current, duration);
        if (isBefore(next, addMinutes(end, 1))) { // Inclusive check
            slots.push({
                start: current,
                end: next,
                selected: true // Default selected
            });
        }
        current = next;
    }
    return slots;
};

export default function TherapistSchedulePage() {
    const { data: session, status } = useSession();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [duration, setDuration] = useState(60);

    const [generatedSlots, setGeneratedSlots] = useState<{ start: Date, end: Date, selected: boolean }[]>([]);
    const [existingSlots, setExistingSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dates with slots
    const [datesWithSlots, setDatesWithSlots] = useState<string[]>([]);
    const [selectedDateFromDropdown, setSelectedDateFromDropdown] = useState("");

    // Callback definitions
    const fetchDatesWithSlots = useCallback(async () => {
        try {
            const res = await fetch(`/api/therapist/slots?mode=dates`);
            if (res.ok) {
                const data = await res.json();
                setDatesWithSlots(data.dates || []);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchExistingSlots = useCallback(async () => {
        setLoading(true);
        try {
            const startOfDayStr = new Date(date).toISOString();
            const endOfDayStr = new Date(new Date(date).setHours(23, 59, 59)).toISOString();

            const res = await fetch(`/api/therapist/slots?start=${startOfDayStr}&end=${endOfDayStr}`);
            if (res.ok) {
                const data = await res.json();
                setExistingSlots(data.slots || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    // Fetch dates with slots on mount
    useEffect(() => {
        if (status === "authenticated") {
            fetchDatesWithSlots();
        }
    }, [status, fetchDatesWithSlots]);

    // Fetch existing slots when date changes
    useEffect(() => {
        if (status === "authenticated" && date) {
            fetchExistingSlots();
        }
    }, [date, status, fetchExistingSlots]);


    const handleGenerate = () => {
        const slots = generateSlots(date, startTime, endTime, duration);
        setGeneratedSlots(slots);
    };

    const toggleSlot = (index: number) => {
        const newSlots = [...generatedSlots];
        newSlots[index].selected = !newSlots[index].selected;
        setGeneratedSlots(newSlots);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const selected = generatedSlots.filter(s => s.selected).map(s => ({
                start: s.start.toISOString(),
                end: s.end.toISOString()
            }));

            if (selected.length === 0) {
                alert("No slots selected to save.");
                setSaving(false);
                return;
            }

            const res = await fetch("/api/therapist/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slots: selected }),
            });

            if (res.ok) {
                alert("Slots saved successfully!");
                setGeneratedSlots([]); // Clear generated
                fetchExistingSlots(); // Refresh list
                fetchDatesWithSlots(); // Refresh dropdown
            } else {
                alert("Failed to save slots.");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving slots.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (slotId: number) => {
        if (!confirm("Are you sure you want to delete this slot?")) return;

        try {
            const res = await fetch(`/api/therapist/slots?id=${slotId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                // Refresh
                fetchExistingSlots();
                fetchDatesWithSlots();
            } else {
                alert("Failed to delete slot.");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting slot.");
        }
    };

    const handleDateDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedDateFromDropdown(val);
        if (val) {
            // Update the main date picker to this date
            setDate(val);
        }
    };

    return (
        <TherapistLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Schedule</h1>
                    <p className="text-gray-500">Create and manage your availability for sessions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-6">

                        {/* Manage Existing Section */}
                        <div className="pb-6 border-b border-gray-100">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                                <Calendar className="w-5 h-5 text-blue-600" /> View Existing
                            </h2>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Select Date with Slots</label>
                                <div className="relative">
                                    <select
                                        value={selectedDateFromDropdown}
                                        onChange={handleDateDropdownChange}
                                        className="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                                    >
                                        <option value="">-- Select Date --</option>
                                        {datesWithSlots.map(d => (
                                            <option key={d} value={d}>{format(new Date(d), 'EEE, MMM do yyyy')}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>


                        <div>
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                                <Plus className="w-5 h-5 text-blue-600" /> Create New Slots
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Duration (Minutes)</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="30">30 Minutes</option>
                                        <option value="45">45 Minutes</option>
                                        <option value="60">60 Minutes</option>
                                        <option value="90">90 Minutes</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                                >
                                    Generate Slots
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Output Area */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Generated Preview */}
                        {generatedSlots.length > 0 && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-lg text-blue-600">Preview New Slots</h2>
                                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                        {generatedSlots.filter(s => s.selected).length} selected
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                    {generatedSlots.map((slot, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => toggleSlot(idx)}
                                            className={`
                                                cursor-pointer px-4 py-3 rounded-xl border-2 text-center transition-all
                                                ${slot.selected
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                                                    : 'border-gray-100 text-gray-400 hover:border-gray-200'}
                                            `}
                                        >
                                            {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Availability</>}
                                </button>
                            </div>
                        )}

                        {/* Existing Slots */}
                        <div>
                            <h2 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5" /> Slots for {format(new Date(date), 'MMMM do, yyyy')}
                            </h2>

                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : existingSlots.length === 0 ? (
                                <div className="text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                                    No slots created for this date yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {existingSlots.map((slot: any) => (
                                        <div key={slot.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-lg">
                                                        {format(new Date(slot.start_time), 'HH:mm')}
                                                    </span>
                                                    <span className="text-gray-400">-</span>
                                                    <span className="font-medium text-gray-600">
                                                        {format(new Date(slot.end_time), 'HH:mm')}
                                                    </span>
                                                </div>
                                                {slot.is_booked === 1 ? (
                                                    <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Booked</span>
                                                ) : (
                                                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Available</span>
                                                )}
                                            </div>

                                            {!slot.is_booked && (
                                                <button
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Slot"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TherapistLayout>
    );
}
