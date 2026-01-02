"use client";

import { useState } from "react";
import { ChevronRight, User, Phone, Calendar } from "lucide-react";

interface OnboardingScreenProps {
    onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        phone: "",
        age: "",
        username: "",
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onComplete();
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
                    {step === 1 && (
                        <div className="space-y-4 animate-slide-up">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 99999 99999"
                                    className="w-full pl-12 pr-4 py-3 bg-warm-sand/50 rounded-xl border-2 border-transparent focus:border-forest-green outline-none transition-all placeholder:text-gray-300"
                                />
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
                                    className="w-full pl-12 pr-4 py-3 bg-warm-sand/50 rounded-xl border-2 border-transparent focus:border-forest-green outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <p className="text-xs text-amber-600/80 bg-amber-50 p-2 rounded-lg">
                                ⚠️ Note: You cannot change this later.
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full bg-forest-green text-white py-4 rounded-2xl font-medium text-lg hover:bg-forest-green/90 transition-all shadow-lg shadow-forest-green/20 flex items-center justify-center gap-2 group"
                >
                    {step === 3 ? "Complete Setup" : "Continue"}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
