"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface LoginScreenProps {
    onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 animate-fade-in relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-soft-sage/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -left-20 w-80 h-80 bg-forest-green/5 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-12">
                <div className="relative w-32 h-32 md:w-40 md:h-40 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                    <Image
                        src="/better-talk-logo.png"
                        alt="Better Talk Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <h1 className="text-4xl md:text-5xl font-semibold text-forest-green tracking-tight">
                        Better Talk
                    </h1>
                    <p className="text-lg text-gray-600 font-light">
                        A safe space for growth, verified mentors, and meaningful connections.
                    </p>
                </div>

                <div className="w-full animate-slide-up" style={{ animationDelay: "0.3s" }}>
                    <button
                        onClick={onLogin}
                        className="group w-full flex items-center justify-center gap-3 bg-forest-green text-white py-4 px-6 rounded-2xl hover:bg-forest-green/90 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl shadow-forest-green/20"
                    >
                        <span className="font-medium text-lg">Continue with Google</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="mt-6 text-sm text-gray-400">
                        By continuing, you agree to our Terms & Privacy Policy
                    </div>
                </div>
            </div>
        </div>
    );
}
