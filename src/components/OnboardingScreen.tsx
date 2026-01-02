"use client";

import { useState, useEffect } from "react";
import { ChevronRight, User, Calendar, Loader2, Phone, CheckCircle, XCircle, ChevronDown, Hash, ArrowRight } from "lucide-react";

interface OnboardingScreenProps {
    onComplete: () => void;
}

const COUNTRIES = [
    { code: "+91", name: "India", flag: "🇮🇳" },
    { code: "+971", name: "UAE", flag: "🇦🇪" },
    { code: "+65", name: "Singapore", flag: "🇸🇬" },
    { code: "+60", name: "Malaysia", flag: "🇲🇾" },
    { code: "+1", name: "USA", flag: "🇺🇸" },
    { code: "+44", name: "UK", flag: "🇬🇧" },
    { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
    { code: "+1", name: "Canada", flag: "🇨🇦" },
    { code: "Other", name: "Other", flag: "🌍" },
];

import { useSession } from "next-auth/react";

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        username: "",
    });

    useEffect(() => {
        if (session?.user?.name) {
            setFormData(prev => ({ ...prev, name: session.user?.name || "" }));
        }
    }, [session]);

    const handleUsernameChange = (val: string) => {
        setFormData(prev => ({ ...prev, username: val }));
    };

    // Alias CheckCircle as CheckCircle2 for compatibility if needed, but actually lucide exports CheckCircle2 usually. 
    // If not, we use CheckCircle. The code uses CheckCircle2.
    const CheckCircle2 = CheckCircle;

    // Username check states
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    const usernameError = (!isCheckingUsername && usernameAvailable === false);

    // Username check states


    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (formData.username.length < 3) {
                setUsernameAvailable(null);
                return;
            }

            setIsCheckingUsername(true);
            try {
                const res = await fetch("/api/user/check-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: formData.username }),
                });
                const data = await res.json();
                setUsernameAvailable(data.available);
            } catch (err) {
                console.error("Failed to check username", err);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (step === 3 && formData.username) {
                checkUsername();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username, step]);


    const handleNext = async () => {
        setError("");
        if (step < 3) {
            if (step === 1) {
                if (!formData.name) { setError("Name is required"); return; }
                if (!phoneNumber) { setError("Phone number is required"); return; }
                if (phoneNumber.length < 5) { setError("Please enter a valid phone number"); return; }
            }
            if (step === 2 && !formData.age) { setError("Age is required"); return; }
            setStep(step + 1);
        } else {
            // Submit form
            if (!formData.username) { setError("Username is required"); return; }
            if (usernameAvailable === false) { setError("Username is already taken"); return; }

            setLoading(true);
            try {
                const fullPhone = `${countryCode} ${phoneNumber}`;
                const res = await fetch("/api/user/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        phone: fullPhone,
                        age: formData.age,
                        username: formData.username
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to create account");
                }

                onComplete();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in bg-brand-bg">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-2">
                    <div className="flex gap-2 mb-8 justify-center">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "w-8 bg-brand-primary" : "w-2 bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <h2 className="text-3xl font-semibold text-brand-dark">
                        {step === 1 && "Let's get started"}
                        {step === 2 && "Tell us about you"}
                        {step === 3 && "Pick your identity"}
                    </h2>
                    <p className="text-gray-500">
                        {step === 1 && "We need your phone number to verify you're real."}
                        {step === 2 && "Helping us match you with the right mentors."}
                        {step === 3 && "Choose a unique anonymous username."}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-soft-clay/30">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4 animate-slide-up">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-warm-sand/50 rounded-xl border-2 border-transparent focus:border-forest-green outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="flex gap-3">
                                <div className="relative w-1/3">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full appearance-none pl-3 pr-8 py-3 bg-warm-sand/50 rounded-xl border-2 border-transparent focus:border-forest-green outline-none transition-all text-sm font-medium"
                                    >
                                        {COUNTRIES.map((c, i) => (
                                            <option key={i} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative w-2/3">
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="99999 99999"
                                        className="w-full px-4 py-3 bg-warm-sand/50 rounded-xl border-2 border-transparent focus:border-forest-green outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-4">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Tell us about you</h1>
                            <p className="text-gray-500">Helping us match you with the right mentors.</p>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Your Age</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="e.g. 24"
                                        className="w-full px-4 py-3 bg-brand-bg/50 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-4">
                                <Hash className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Choose your<br />Identity</h1>
                            <p className="text-gray-500">Pick a unique anonymous name. This is how you&apos;ll be known in the community.</p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                                    <input
                                        value={formData.username}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        className={`w-full bg-white border-2 rounded-xl px-4 py-4 pl-10 text-lg font-medium outline-none transition-all ${usernameError
                                            ? "border-red-300 focus:border-red-500"
                                            : isCheckingUsername
                                                ? "border-brand-primary/50"
                                                : usernameAvailable === true
                                                    ? "border-green-400"
                                                    : "border-transparent focus:border-brand-primary"
                                            }`}
                                        placeholder="cool_panda_99"
                                    />
                                    {isCheckingUsername && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary animate-spin" />
                                    )}
                                    {usernameAvailable === true && !isCheckingUsername && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                {usernameError && (
                                    <p className="text-xs text-red-500 font-medium">Username already taken</p>
                                )}
                                <p className="text-xs text-amber-600/80 bg-amber-50 p-2 rounded-lg">
                                    ⚠️ Note: You cannot change this later.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    disabled={loading || (step === 1 && (!phoneNumber || !formData.name)) || (step === 2 && !formData.age) || (step === 3 && (!formData.username || usernameAvailable === false))}
                    className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none mt-8 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            {step === 3 ? "Complete Setup" : "Continue"}
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
