"use client";

import { useState, useEffect } from "react";
import { ChevronRight, User, Calendar, Loader2, Phone, CheckCircle, XCircle, ChevronDown } from "lucide-react";

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

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [formData, setFormData] = useState({
        age: "",
        username: "",
    });

    // Username check states
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

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
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in bg-warm-sand">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-2">
                    <div className="flex gap-2 mb-8 justify-center">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "w-8 bg-forest-green" : "w-2 bg-soft-clay"
                                    }`}
                            />
                        ))}
                    </div>
                    <h2 className="text-3xl font-semibold text-forest-green">
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
                        <div className="space-y-4 animate-slide-up">
                            <label className="block text-sm font-medium text-gray-700">Your Age</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="e.g. 24"
                                    className="w-full pl-12 pr-4 py-3 bg-warm-sand/50 rounded-xl border-2 border-transparent focus:border-forest-green outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-slide-up">
                            <label className="block text-sm font-medium text-gray-700">Anonymous Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="e.g. SilentWarrior"
                                    className={`w-full pl-12 pr-10 py-3 bg-warm-sand/50 rounded-xl border-2 outline-none transition-all placeholder:text-gray-300 ${usernameAvailable === true ? "border-green-500 focus:border-green-500" :
                                            usernameAvailable === false ? "border-red-500 focus:border-red-500" :
                                                "border-transparent focus:border-forest-green"
                                        }`}
                                />

                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {isCheckingUsername && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                                    {!isCheckingUsername && usernameAvailable === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {!isCheckingUsername && usernameAvailable === false && <XCircle className="w-5 h-5 text-red-500" />}
                                </div>
                            </div>

                            {usernameAvailable === false && (
                                <p className="text-xs text-red-500 font-medium">Username already taken</p>
                            )}

                            <p className="text-xs text-amber-600/80 bg-amber-50 p-2 rounded-lg">
                                ⚠️ Note: You cannot change this later.
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    disabled={loading || (step === 3 && usernameAvailable === false)}
                    className="w-full bg-forest-green text-white py-4 rounded-2xl font-medium text-lg hover:bg-forest-green/90 transition-all shadow-lg shadow-forest-green/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            {step === 3 ? "Complete Setup" : "Continue"}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
