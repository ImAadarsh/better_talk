"use client";

import { useState, useEffect } from "react";
import ScientificLoader from "@/components/ScientificLoader";
import { format, addMinutes, parse, isBefore, startOfDay } from "date-fns";
import { Calendar, Clock, Plus, Trash2, User, ChevronDown, Save, Loader2 } from "lucide-react";

export default function SlotManagementPage() {
    const [loading, setLoading] = useState(true);
    const [therapists, setTherapists] = useState<any[]>([]);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [selectedFilterDate, setSelectedFilterDate] = useState<string>("all");

    // Generator state
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [generatedSlots, setGeneratedSlots] = useState<any[]>([]);
    const [existingSlots, setExistingSlots] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTherapists();
    }, []);

    useEffect(() => {
        if (selectedTherapistId) {
            fetchPlans(selectedTherapistId);
            fetchExistingSlots(selectedTherapistId);
        } else {
            setPlans([]);
            setExistingSlots([]);
        }
    }, [selectedTherapistId]);

    const fetchTherapists = async () => {
        try {
            const res = await fetch("/api/admin/therapists");
            const data = await res.json();
            setTherapists(data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch therapists", error);
        }
    };

    const fetchPlans = async (mentorId: string) => {
        try {
            const res = await fetch(`/api/admin/plans?mentor_id=${mentorId}`);
            const data = await res.json();
            const activePlans = (data || []).filter((p: any) => p.is_active === 1);
            setPlans(activePlans);
            if (activePlans.length > 0) setSelectedPlanId(activePlans[0].id.toString());
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const fetchExistingSlots = async (mentorId: string) => {
        try {
            const res = await fetch(`/api/admin/slots?mentor_id=${mentorId}`);
            const data = await res.json();
            setExistingSlots(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = () => {
        if (!selectedPlanId) return alert("Select a plan first");
        const plan = plans.find(p => p.id.toString() === selectedPlanId);
        if (!plan) return;

        if (isBefore(parse(date, 'yyyy-MM-dd', new Date()), startOfDay(new Date()))) {
            alert("Cannot generate slots for past dates.");
            return;
        }

        const duration = parseInt(plan.session_duration_min);
        const slots = [];
        let current = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
        const end = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

        while (isBefore(current, end)) {
            const next = addMinutes(current, duration);
            if (isBefore(next, addMinutes(end, 1))) {
                slots.push({
                    start: current,
                    end: next,
                    selected: true
                });
            }
            current = next;
        }
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

            const res = await fetch("/api/admin/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentor_id: selectedTherapistId,
                    plan_id: selectedPlanId,
                    slots: selected
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.conflicts > 0) {
                    alert(`${data.conflicts} slots were skipped because they overlap with existing ones.`);
                }
                setGeneratedSlots([]);
                fetchExistingSlots(selectedTherapistId);
            } else if (res.status === 409) {
                alert("Creation failed: All generated slots overlap with existing availability.");
            } else {
                const error = await res.json();
                alert(`Error: ${error.error || "Failed to save slots"}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchExistingSlots(selectedTherapistId);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><ScientificLoader /></div>;

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Slot Management</h1>
                <p className="text-gray-500 font-medium">Create and manage therapist availability based on configured plans.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit space-y-8">
                    <div className="space-y-4 pb-6 border-b border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Therapist</label>
                        <select
                            value={selectedTherapistId}
                            onChange={(e) => setSelectedTherapistId(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none transition-all font-bold text-gray-900"
                        >
                            <option value="">-- Therapist --</option>
                            {therapists.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedTherapistId && (
                        <>
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Plan</label>
                                <select
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold"
                                >
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>INR {p.price_in_inr} - {p.session_duration_min}m</option>
                                    ))}
                                    {plans.length === 0 && <option value="">No active plans found</option>}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Generation Settings</label>
                                <input
                                    type="date"
                                    value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold"
                                    />
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={plans.length === 0}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/10 disabled:opacity-50"
                            >
                                Generate Slots
                            </button>
                        </>
                    )}
                </div>

                {/* Slots Area */}
                <div className="lg:col-span-2 space-y-8">
                    {!selectedTherapistId ? (
                        <div className="bg-gray-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900">Therapist Required</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">Please select a therapist from the sidebar to manage their availability.</p>
                        </div>
                    ) : (
                        <>
                            {generatedSlots.length > 0 && (
                                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-blue-600" /> New Preview
                                        </h2>
                                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-blue-100">
                                            {generatedSlots.filter(s => s.selected).length} Selected
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                        {generatedSlots.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => toggleSlot(idx)}
                                                className={`py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm ${s.selected
                                                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                    }`}
                                            >
                                                {format(s.start, 'HH:mm')} - {format(s.end, 'HH:mm')}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Confirm and Create Slots</>}
                                    </button>
                                </div>
                            )}

                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 shrink-0">
                                        <Calendar className="w-5 h-5 text-gray-400" /> Current Availability
                                    </h2>

                                    <div className="flex items-center gap-3">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Date</label>
                                        <select
                                            value={selectedFilterDate}
                                            onChange={(e) => setSelectedFilterDate(e.target.value)}
                                            className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 outline-none text-xs font-bold text-gray-700 min-w-[140px]"
                                        >
                                            <option value="all">All Dates</option>
                                            {Array.from(new Set(existingSlots.map(s => format(new Date(s.start_time), 'yyyy-MM-dd'))))
                                                .sort()
                                                .map(d => (
                                                    <option key={d} value={d}>{format(new Date(d), 'MMM do, yyyy')}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {existingSlots.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-gray-400 italic">No existing slots found.</div>
                                    ) : (
                                        existingSlots
                                            .filter(s => selectedFilterDate === "all" || format(new Date(s.start_time), 'yyyy-MM-dd') === selectedFilterDate)
                                            .map(s => (
                                                <div key={s.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-gray-200 transition-all">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900">
                                                                {selectedFilterDate === "all"
                                                                    ? format(new Date(s.start_time), 'MMM do, HH:mm')
                                                                    : format(new Date(s.start_time), 'HH:mm')
                                                                }
                                                            </span>
                                                            <span className="text-gray-300">-</span>
                                                            <span className="text-gray-500 font-medium">{format(new Date(s.end_time), 'HH:mm')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">{s.session_duration_min}m</span>
                                                            {s.is_booked === 1 ? (
                                                                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">Booked</span>
                                                            ) : (
                                                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Free</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!s.is_booked && (
                                                        <button
                                                            onClick={() => handleDeleteSlot(s.id)}
                                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
