"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function TherapistLoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user) {
            // Check if mentor, otherwise maybe show error or redirect to normal home
            // For now, assume if they login here they intend to be a therapist
            // We can handle role checks in the dashboard or middleware
            router.push("/therapist/dashboard");
        }
    }, [session, router]);

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/" });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Left Side - Hero / Branding */}
            <div className="md:w-1/2 bg-blue-600 p-8 md:p-16 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                        <Image src="/better-talk-logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Empower Lives through <br />
                        <span className="text-blue-200">BetterTalk.</span>
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                        Join our network of verified professionals. Manage your appointments, connect with patients, and grow your practice with our dedicated tools.
                    </p>
                </div>

                <div className="relative z-10 mt-12 md:mt-0">
                    <p className="text-sm text-blue-200">Trusted by 500+ Therapists</p>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist Portal</h2>
                        <p className="text-gray-500">Sign in to manage your practice</p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                    >
                        <Image
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            width={24}
                            height={24}
                        />
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Continue with Google</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                    </button>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        <p>Not a therapist yet? <a href="/therapist" className="text-blue-600 hover:underline">Apply here</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
