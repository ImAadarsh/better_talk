"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, GraduationCap, Loader2, LogOut, Phone, Stethoscope, Users, FileText, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ScientificLoader from "@/components/ScientificLoader";


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

export default function TherapistOnboarding() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        designation: "",
        patientsTreated: "",
        bio: "",
    });

    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setFormData(prev => ({ ...prev, fullName: session.user?.name || "" }));
        }

        // Check if already applied
        const checkStatus = async () => {
            try {
                const res = await fetch("/api/therapist/status");
                if (res.ok) {
                    const data = await res.json();
                    if (data.applied) {
                        setIsSubmitted(true);
                        if (data.isVerified) {
                            setIsVerified(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to check status", err);
            }
        };

        if (status === "authenticated") {
            checkStatus();
        }

    }, [session, status]);

    // If verified, redirect to proper dashboard
    useEffect(() => {
        if (isVerified) {
            router.replace('/therapist/dashboard');
        }
    }, [isVerified, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fullPhone = `${countryCode} ${phoneNumber}`;

            const res = await fetch("/api/therapist/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    contactNumber: fullPhone
                }),
            });

            if (res.ok) {
                setIsSubmitted(true);
            } else {
                // Handle error
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center bg-brand-bg">
                <ScientificLoader />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-white flex flex-col md:flex-row">
                {/* Left Side - Hero / Branding (Same as Login) */}
                <div className="md:w-1/2 bg-blue-600 p-8 md:p-16 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                            <Image src="/better-talk-logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Join as a <br />
                            <span className="text-blue-200">Therapist.</span>
                        </h1>
                        <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                            Help us build a safer community. Share your expertise, manage your practice, and connect with those who need it most.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <p className="text-sm text-blue-200">Trusted by 500+ professionals</p>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
                </div>

                {/* Right Side - Action */}
                <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-gray-50">
                    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</h2>
                            <p className="text-gray-500">Apply to become a verified therapist</p>
                        </div>

                        <button
                            onClick={() => signIn("google")}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group mb-6"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={24} height={24} />
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">Continue with Google</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                        </button>

                        <div className="text-center text-sm text-gray-400">
                            <p>Already a therapist? <Link href="/therapist/login" className="text-blue-600 hover:underline">Login here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Role Check: If user is "user", block them.
    if ((session.user as any).role === 'user') {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-red-500/5 max-w-md w-full text-center border-l-4 border-red-500">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogOut className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-500 mb-8">
                        You are already registered as a standard User. To maintain community safety, you cannot apply as a Therapist with this account.
                    </p>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Sign Out & Use Different Account
                    </button>
                </div>
            </div>
        )
    }



    if (isVerified) {
        return (
            <div className="h-screen flex items-center justify-center bg-brand-bg">
                <ScientificLoader />
            </div>
        );
    }

    // If submitted but not verified
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-brand-primary/5 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                    <p className="text-gray-500 mb-8">
                        Thank you for applying. Our team will review your profile and verify your credentials. You will be notified once approved.
                    </p>

                    <div className="p-4 bg-gray-50 rounded-xl mb-6 text-sm text-gray-600">
                        <p>Current Status:</p>
                        <span className="font-bold text-amber-500 flex items-center justify-center gap-2 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Pending Verification
                        </span>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-gray-400 hover:text-red-500 text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-bg py-12 px-4">
            <div className="max-w-2xl mx-auto pb-32">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="text-gray-500 mt-2">Just a few more details to get you verified.</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-brand-primary/5 border border-brand-primary/10">
                    {/* User Info Read-only */}
                    <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                            {session.user?.image ? (
                                <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                            ) : (
                                <Users className="w-6 h-6 m-auto mt-3 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">{session.user?.name}</p>
                            <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brand-primary" /> Full Name
                                </label>
                                <input
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                    placeholder="Dr. John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-brand-primary" /> Contact Number
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative w-1/3">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="w-full appearance-none pl-3 pr-8 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm font-medium"
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
                                            required
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                            placeholder="99999 99999"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-brand-primary" /> Designation
                                </label>
                                <input
                                    required
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                    placeholder="Clinical Psychologist"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brand-primary" /> Patients Treated
                                </label>
                                <input
                                    required
                                    type="number"
                                    value={formData.patientsTreated}
                                    onChange={(e) => setFormData({ ...formData, patientsTreated: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                    placeholder="e.g. 500+"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand-primary" /> Bio / Expertise
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                                placeholder="Tell us about your experience and specialization..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Application"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
