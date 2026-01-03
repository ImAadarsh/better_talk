"use client";

import { Shield, Users, Award, Lock, ArrowRight, Heart, Sparkles, Zap, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-blue-50/50 to-white -z-10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-8"
                    >
                        <Heart className="w-4 h-4 text-rose-500 fill-current" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Our Story</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight"
                    >
                        We&apos;re building a world where <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">no one feels alone.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10"
                    >
                        BetterTalk is more than just a platform—it&apos;s a movement to democratize mental health support, connecting you with empathy and expertise when you need it most.
                    </motion.p>
                </div>
            </section>

            {/* Mission Section with Stats */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">Bridging the gap between silence and support.</h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-6">
                                Mental health struggles often thrive in isolation. We built BetterTalk to break that cycle by offering a platform where you can share your story without fear of judgment.
                            </p>
                            <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                Whether you need the empathy of a peer group or the guidance of a licensed professional, we provide the tools to help you navigate life&apos;s challenges anonymously and securely.
                            </p>

                            <div className="flex gap-4">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                                            <Image
                                                src={`https://source.unsplash.com/random/100x100?face&sig=${i}`}
                                                width={48}
                                                height={48}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="font-bold text-gray-900">Join 10,000+ others</span>
                                    <span className="text-sm text-gray-500">starting their journey today</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[3rem] -rotate-3 transform scale-[1.02]" />
                            <div className="relative bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                                <div className="grid grid-cols-2 gap-6">
                                    <StatCard number="10k+" label="Active Members" icon={<Users className="w-6 h-6 text-blue-500" />} />
                                    <StatCard number="500+" label="Verified Therapists" icon={<Shield className="w-6 h-6 text-green-500" />} />
                                    <StatCard number="24/7" label="Support Available" icon={<Activity className="w-6 h-6 text-rose-500" />} />
                                    <StatCard number="100%" label="Private & Secure" icon={<Lock className="w-6 h-6 text-purple-500" />} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values / How it Works */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-brand-primary font-bold tracking-wider text-sm uppercase">Our Values</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">Built on trust and empathy</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">We&apos;ve designed every aspect of BetterTalk to prioritize your safety, privacy, and personal growth.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-blue-600" />}
                            title="Safe Space"
                            desc="A strictly moderated, judgment-free zone where you can share your inner thoughts openly."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<Lock className="w-8 h-8 text-purple-600" />}
                            title="Total Anonymity"
                            desc="Your identity is protected by default. We never share your personal data without consent."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Sparkles className="w-8 h-8 text-amber-500" />}
                            title="Growth Focused"
                            desc="From peer support to professional therapy, every tool is designed to help you move forward."
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0F172A]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start looking forward?</h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Join thousands of others who are taking the first step towards a healthier mind today.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-10 py-5 rounded-full hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                        >
                            Join the Community <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function StatCard({ number, label, icon }: { number: string, label: string, icon: any }) {
    return (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100/50 hover:bg-blue-50/50 transition-colors group">
            <div className="mb-4 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{number}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
        </div>
    );
}

function FeatureCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -10 }}
            className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
        </motion.div>
    );
}
