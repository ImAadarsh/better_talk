"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function BookingSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const therapistName = searchParams.get("therapist") || "your therapist";

    useEffect(() => {
        // Trigger confetti animation
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardLayout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">
                    {/* Success Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-brand-primary/10 border border-brand-primary/20 text-center">
                        {/* Success Icon */}
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-6 animate-scale-up">
                            <CheckCircle className="w-16 h-16 text-green-500 fill-green-500 text-white" />
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Booking Confirmed! 🎉
                        </h1>

                        {/* Message */}
                        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                            Your session with <span className="font-semibold text-brand-primary">{therapistName}</span> has been successfully booked.
                            A confirmation email has been sent to your registered email address.
                        </p>

                        {/* Info Box */}
                        <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
                            <div className="flex items-start gap-4 text-left">
                                <Calendar className="w-6 h-6 text-brand-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li>• Check your email for session details and meeting link</li>
                                        <li>• You'll receive a reminder 24 hours before your session</li>
                                        <li>• View all your sessions in the Sessions tab</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/sessions"
                                className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/25 hover:scale-105"
                            >
                                View My Sessions
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/therapists"
                                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-brand-primary/30 hover:bg-gray-50 transition-all"
                            >
                                Browse Therapists
                            </Link>
                        </div>
                    </div>

                    {/* Additional Help */}
                    <p className="text-center text-sm text-gray-500 mt-8">
                        Need to reschedule? Contact us at{" "}
                        <a href="mailto:support@bettertalk.com" className="text-brand-primary hover:underline font-medium">
                            support@bettertalk.com
                        </a>
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
