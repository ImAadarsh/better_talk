"use client";

import { Shield, Users, Award, Lock, ArrowRight, Activity, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <PublicNavbar />

            {/* Hero */}
            <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        A safe space for <span className="text-brand-primary">real growth.</span>
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        BetterTalk is a mental health and self-growth platform designed to connect you with supportive communities and expert mentors—anonymously and securely.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">Our Mission</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Bridging the gap between silence and support.</h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-6">
                                Mental health struggles often thrive in isolation. We built BetterTalk to break that cycle by offering a platform where you can share your story without fear of judgment.
                            </p>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                Whether you need the empathy of a peer group or the guidance of a licensed professional, we provide the tools to help you navigate life&apos;s challenges.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-3xl -rotate-2 scale-[1.02] opacity-50 blur-xl"></div>
                            <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 aspect-square flex flex-col justify-center">
                                <div className="grid grid-cols-2 gap-4">
                                    <StatCard number="10k+" label="Active Members" />
                                    <StatCard number="500+" label="verified Therapists" />
                                    <StatCard number="24/7" label="Community Support" />
                                    <StatCard number="100%" label="Private & Secure" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How BetterTalk Works</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">It&apos;s okay not to be okay. But it&apos;s also okay to ask for help using BetterTalk.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                        <Feature
                            icon={<Shield className="w-8 h-8 text-blue-500" />}
                            title="Safe Space"
                            desc="A judgment-free zone where you can share your thoughts openly."
                        />
                        <Feature
                            icon={<Lock className="w-8 h-8 text-purple-500" />}
                            title="Anonymous"
                            desc="Your identity is protected. Share without fear of stigma."
                        />
                        <Feature
                            icon={<Users className="w-8 h-8 text-green-500" />}
                            title="Community"
                            desc="Connect with others who understand what you're going through."
                        />
                    </div>
                </div>
            </section>

            {/* Safety & Roles */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl font-bold mb-6">Designed for Trust & Safety</h2>
                            <div className="space-y-6">
                                <RoleCard
                                    title="verified Therapists"
                                    desc="All mentors undergo a strict verification process. Look for the blue tick badge to ensure you are speaking with a qualified professional."
                                />
                                <RoleCard
                                    title="Private Data"
                                    desc="Your personal details (email, phone) are encrypted and never shared with other users or mentors without your consent."
                                />
                            </div>
                            <div className="mt-10">
                                <Link href="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors">
                                    Join the Community <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}

function StatCard({ number, label }: { number: string, label: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{number}</div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
        </div>
    );
}

function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}

function RoleCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1 min-w-[24px]">
                <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
                <h4 className="font-bold text-lg mb-1">{title}</h4>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
