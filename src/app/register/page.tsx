"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import confetti from "canvas-confetti";

export default function RegisterPage() {
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const handleLogin = () => {
        signIn("google", { callbackUrl: "/sessions" });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-secondary/40 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[80px]" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 animate-slide-up relative z-10">
                <div className="text-center space-y-3 mb-10">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Image src="/better-talk-logo.png" alt="Logo" width={48} height={48} className="-rotate-3" />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-text tracking-tight">Create Account</h1>
                    <p className="text-gray-500 text-sm">Join the conversation with your community</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full bg-brand-dark text-white py-4 px-6 rounded-xl font-medium shadow-lg shadow-brand-dark/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                    <Image src="https://www.google.com/favicon.ico" alt="G" width={20} height={20} className="w-5 h-5 bg-white rounded-full p-0.5" />
                    <span>Sign up with Google</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Already have an account?{" "}
                    <Link href="/" className="text-brand-primary font-medium hover:underline">
                        Sign In
                    </Link>
                </p>

                <p className="text-center text-xs text-gray-400 mt-4">
                    By continuing, you agree to our Terms & Privacy Policy
                </p>
            </div>
        </div>
    );
}
