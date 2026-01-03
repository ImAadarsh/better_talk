"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            if ((session.user as any).role === 'admin') {
                router.push("/adx");
            } else {
                // Not an admin, maybe show error or redirect home
                router.push("/");
            }
        }
    }, [status, session, router]);

    const handleLogin = () => {
        signIn("google", { callbackUrl: "/adx" });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative z-10">
                <div className="text-center space-y-4 mb-10">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-900/20 p-3">
                        <Image
                            src="/better-talk-logo.png"
                            alt="BetterTalk"
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full w-fit mx-auto border border-gray-100 italic">
                        Authorized Personnel Only
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Please sign in with your administrator-linked Google account to access platform management tools.
                        </p>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 group"
                    >
                        <Image src="https://www.google.com/favicon.ico" alt="G" width={20} height={20} className="w-5 h-5 bg-white rounded-full p-0.5" />
                        <span>Sign in with Google</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                    <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                        Back to BetterTalk
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] text-center">
                <span className="text-gray-400">Design & Developed By <a href="https://endevourdigital.in" target="_blank" className="text-gray-900 hover:text-gray-600 transition-colors">Endeavour Digital</a></span>
            </p>

        </div>
    );
}
