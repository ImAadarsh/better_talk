"use client";

import Link from "next/link";
import { ArrowRight, Heart, Shield, Users, Star, Play, CheckCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
    const welcomeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "paintWorklet" in CSS) {
            // @ts-ignore
            CSS.paintWorklet.addModule(
                "https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js"
            );
        }

        const handlePointerMove = (e: PointerEvent) => {
            if (!welcomeRef.current) return;

            const rect = welcomeRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            welcomeRef.current.classList.add("interactive");
            welcomeRef.current.style.setProperty("--ring-x", x.toString());
            welcomeRef.current.style.setProperty("--ring-y", y.toString());
            welcomeRef.current.style.setProperty("--ring-interactive", "1");
        };

        const handlePointerLeave = () => {
            if (!welcomeRef.current) return;
            welcomeRef.current.classList.remove("interactive");
            welcomeRef.current.style.setProperty("--ring-x", "50");
            welcomeRef.current.style.setProperty("--ring-y", "50");
            welcomeRef.current.style.setProperty("--ring-interactive", "0");
        };

        const section = welcomeRef.current;
        if (section) {
            section.addEventListener("pointermove", handlePointerMove);
            section.addEventListener("pointerleave", handlePointerLeave);
        }

        return () => {
            if (section) {
                section.removeEventListener("pointermove", handlePointerMove);
                section.removeEventListener("pointerleave", handlePointerLeave);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-primary/20">
            <PublicNavbar />

            {/* Hero Section */}
            <section id="welcome" ref={welcomeRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 1.5 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-50 rounded-[100%] blur-3xl -z-10 animate-pulse-slow"
                />

                {/* Snake Pattern Lines - Increased Frequency */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        <path d="M 0,80 Q 180,40 360,80 T 720,80 T 1200,80" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" className="animate-snake-1" opacity="0.35" />
                        <path d="M 0,150 Q 200,110 400,150 T 800,150 T 1200,150" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-snake-2" opacity="0.3" />
                        <path d="M 0,220 Q 150,180 300,220 T 600,220 T 900,220 T 1200,220" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" className="animate-snake-3" opacity="0.3" />
                        <path d="M 0,290 Q 180,250 360,290 T 720,290 T 1200,290" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-snake-1" opacity="0.25" style={{ animationDelay: '0.5s' }} />
                        <path d="M 0,360 Q 200,320 400,360 T 800,360 T 1200,360" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" className="animate-snake-2" opacity="0.3" style={{ animationDelay: '1s' }} />
                        <path d="M 0,430 Q 150,390 300,430 T 600,430 T 900,430 T 1200,430" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-snake-3" opacity="0.25" style={{ animationDelay: '1.5s' }} />
                        <path d="M 0,500 Q 180,460 360,500 T 720,500 T 1200,500" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" className="animate-snake-1" opacity="0.3" style={{ animationDelay: '2s' }} />
                        <path d="M 0,570 Q 200,530 400,570 T 800,570 T 1200,570" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-snake-2" opacity="0.35" style={{ animationDelay: '2.5s' }} />
                        <path d="M 0,640 Q 150,600 300,640 T 600,640 T 900,640 T 1200,640" stroke="url(#gradient1)" strokeWidth="1.5" fill="none" className="animate-snake-3" opacity="0.3" style={{ animationDelay: '3s' }} />
                        <path d="M 0,710 Q 180,670 360,710 T 720,710 T 1200,710" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-snake-1" opacity="0.25" style={{ animationDelay: '3.5s' }} />
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.5" />
                                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.5" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.5" />
                                <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.5" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        <path d="M 150,0 Q 130,120 150,240 T 150,480 T 150,720 T 150,800" stroke="url(#gradient3)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-1" opacity="0.2" />
                        <path d="M 300,0 Q 280,120 300,240 T 300,480 T 300,720 T 300,800" stroke="url(#gradient4)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-2" opacity="0.2" style={{ animationDelay: '0.3s' }} />
                        <path d="M 450,0 Q 430,120 450,240 T 450,480 T 450,720 T 450,800" stroke="url(#gradient3)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-1" opacity="0.2" style={{ animationDelay: '0.6s' }} />
                        <path d="M 600,0 Q 580,120 600,240 T 600,480 T 600,720 T 600,800" stroke="url(#gradient4)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-2" opacity="0.2" style={{ animationDelay: '0.9s' }} />
                        <path d="M 750,0 Q 730,120 750,240 T 750,480 T 750,720 T 750,800" stroke="url(#gradient3)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-1" opacity="0.2" style={{ animationDelay: '1.2s' }} />
                        <path d="M 900,0 Q 880,120 900,240 T 900,480 T 900,720 T 900,800" stroke="url(#gradient4)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-2" opacity="0.2" style={{ animationDelay: '1.5s' }} />
                        <path d="M 1050,0 Q 1030,120 1050,240 T 1050,480 T 1050,720 T 1050,800" stroke="url(#gradient3)" strokeWidth="1.5" fill="none" className="animate-snake-vertical-1" opacity="0.2" style={{ animationDelay: '1.8s' }} />
                        <defs>
                            <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
                                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.35" />
                            </linearGradient>
                            <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                                <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.35" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Safe & Anonymous Space</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                    >
                        Find your inner <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">peace and clarity.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Join a supportive community where you can share your thoughts, connect with expert therapists, and grow at your own pace.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/register" className="h-14 px-8 rounded-full bg-gray-900 text-white font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 hover:-translate-y-1">
                            Start your journey <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/about" className="h-14 px-8 rounded-full bg-white border border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all hover:border-gray-300">
                            <Play className="w-4 h-4 fill-current" /> How it works
                        </Link>
                    </motion.div>

                    {/* Stats/Social Proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="mt-16 flex items-center justify-center gap-8 md:gap-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                                ))}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">10k+</p>
                                <p className="text-xs text-gray-500">Members</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-left">
                            <div className="flex items-center text-amber-400 mb-0.5">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <p className="text-xs text-gray-500">Rated 4.9/5 by users</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-[#2F3E35] text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Why BetterTalk?</h2>
                        <p className="text-white/70 max-w-xl mx-auto">We provide the tools and community you need to prioritize your mental well-being.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-blue-600" />}
                            title="Community Support"
                            desc="Connect with people who understand what you're going through in moderated groups."
                            color="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-purple-600" />}
                            title="Private & Secure"
                            desc="Your privacy is our priority. Share openly with anonymous options and secure data."
                            color="bg-purple-50"
                        />
                        <FeatureCard
                            icon={<Heart className="w-6 h-6 text-rose-600" />}
                            title="Expert Therapy"
                            desc="Access licensed therapists for 1-on-1 sessions to guide your personal growth."
                            color="bg-rose-50"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-brand-primary font-bold tracking-wider text-sm uppercase">Simple Steps</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">How to get started</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-10" />

                        {[
                            { step: "01", title: "Sign Up", desc: "Create your anonymous account in seconds." },
                            { step: "02", title: "Join Groups", desc: "Find communities that resonate with you." },
                            { step: "03", title: "Connect", desc: "Share your story or book a mentor." },
                            { step: "04", title: "Thrive", desc: "Track your progress and grow." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center relative"
                            >
                                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 border-4 border-white">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive: Mentorship */}
            <section id="deep-dive-mentorship" className="py-24 px-6 bg-[#2F3E35] text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:w-1/2"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold mb-6 uppercase tracking-wider border border-white/20">Expert Guidance</div>
                        <h2 className="text-4xl font-bold mb-6 text-white">1-on-1 Mentorship.</h2>
                        <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                            Book private sessions with verified therapists and mentors. Choose plans that fit your schedule and budget, and communicate through secure, time-bound chat sessions.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-200">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Star className="w-3 h-3 text-white" /></div>
                                Verified Professionals
                            </li>
                            <li className="flex items-center gap-3 text-gray-200">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Star className="w-3 h-3 text-white" /></div>
                                Flexible booking plans
                            </li>
                        </ul>
                        <Link href="/therapist" className="bg-white text-[#2F3E35] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg">
                            Find a Therapist <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                    <div className="md:w-1/2 relative">
                        <div className="absolute inset-0 bg-gradient-to-bl from-[#4A6756] to-transparent rounded-full blur-3xl opacity-50"></div>
                        <div className="relative bg-white/10 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                                    <div>
                                        <div className="text-lg font-bold text-white">Dr. Sarah Smith</div>
                                        <div className="text-gray-300 text-sm">Clinical Psychologist</div>
                                    </div>
                                </div>
                                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">Verified</div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="text-sm font-bold text-gray-200 mb-1">Anxiety Relief Session</div>
                                    <div className="text-xs text-gray-400">30 min call + 5 days chat</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="text-sm font-bold text-gray-200 mb-1">Career Stress Management</div>
                                    <div className="text-xs text-gray-400">45 min call + 7 days chat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive: Groups */}
            <section id="deep-dive-groups" className="py-24 px-6 bg-blue-50/30 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="md:w-1/2"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">Community</div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Find your tribe.</h2>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Join specialized groups for Anxiety, Relationships, Career Stress, and more. Share your thoughts, comment on others&apos; posts, and feel the power of shared experience.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Moderated safe spaces
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Anonymous posting
                            </li>
                            <li className="flex items-center gap-3 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500" /> verified Therapist participation
                            </li>
                        </ul>
                        <Link href="/register" className="text-brand-primary font-bold hover:underline flex items-center gap-2">Explore Groups <ArrowRight className="w-4 h-4" /></Link>
                    </motion.div>

                    {/* Visual Placeholder for Groups */}
                    <div className="md:w-1/2 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-transparent rounded-full blur-3xl opacity-50"></div>
                        <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <div className="flex gap-4 items-center mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <div className="font-bold">Anxiety Support</div>
                                    <div className="text-xs text-gray-400">1.2k Members</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-gray-100 rounded w-full"></div>
                                <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA for Therapists */}
            <section className="py-20 px-6 bg-[#2F3E35] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A6756]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Are you a licensed therapist?</h2>
                    <p className="text-gray-100 text-lg mb-10 max-w-2xl mx-auto">
                        Join our network of verified professionals and help people improve their mental well-being while growing your practice.
                    </p>
                    <Link href="/therapist" className="inline-flex items-center gap-2 bg-white text-[#2F3E35] font-bold px-10 py-4 rounded-full hover:scale-105 transition-transform">
                        Apply as a Mentor <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>



            {/* FAQs */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <FaqItem q="Is BetterTalk really anonymous?" a="Yes! You choose an anonymous username during onboarding, and your personal details like email and phone are never shared publicly." />
                        <FaqItem q="How do I become a verified Therapist?" a="You can apply through our therapist portal. We review certifications and experience before granting the verified badge." />
                        <FaqItem q="Is the platform free to use?" a="Joining groups and community discussions is completely free. 1-on-1 mentorship sessions are paid bookings." />
                        <FaqItem q="Can I delete my account?" a="Yes, you can request account deletion at any time from your profile settings." />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5 }}
            className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
        >
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">
                {desc}
            </p>
        </motion.div>
    );
}

function FaqItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {q}
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-4 pt-0 text-gray-500 bg-white border-t border-gray-100">
                    {a}
                </div>
            </div>
        </div>
    );
}
