"use client";

import { Quote, ArrowRight, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function StoriesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <PublicNavbar />

            {/* Hero */}
            <section className="py-20 bg-warm-sand/30 text-center px-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                    <Heart className="w-3 h-3 fill-current" /> Community Stories
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Real people. Real growth.</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Discover how BetterTalk is helping people navigate life&apos;s challenges, one conversation at a time.
                </p>
            </section>

            {/* Testimonials Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StoryCard
                        category="Anxiety Support"
                        content="I felt alone for years with my anxiety. Joining the 'Anxiety Relief' group here changed everything. Just knowing others felt the same way gave me the courage to seek help."
                        author="Anonymous User"
                        role="Member since 2023"
                        color="bg-blue-50 border-blue-100"
                    />
                    <StoryCard
                        category="Career Growth"
                        content="My mentor helped me navigate a tough career transition. The daily chat support kept me grounded when I was doubting myself. I landed my dream job last month!"
                        author="Sarah J."
                        role="Product Designer"
                        color="bg-purple-50 border-purple-100"
                    />
                    <StoryCard
                        category="Relationship Advice"
                        content="The breakdown of my long-term relationship was devastating. The 1-on-1 sessions gave me a safe space to vent and rebuild my confidence step by step."
                        author="Mike T."
                        role="Member since 2024"
                        color="bg-rose-50 border-rose-100"
                    />
                    <StoryCard
                        category="Self Discovery"
                        content="I never realized how much burying my emotions was hurting me until I started journaling here. The community is so supportive and non-judgmental."
                        author="Anonymous"
                        role="Student"
                        color="bg-amber-50 border-amber-100"
                    />
                    <StoryCard
                        category="Depression"
                        content="It's not a magic fix, but having a place to go when the dark thoughts hit has been a lifesaver. My mentor checks in on me exactly when I need it."
                        author="David L."
                        role="Member since 2023"
                        color="bg-slate-50 border-slate-100"
                    />
                    <StoryCard
                        category="Parenting"
                        content="Being a new mom is isolating. The parenting group here connected me with other moms who just 'get it'. We support each other through the sleepless nights."
                        author="Emily R."
                        role="New Mom"
                        color="bg-green-50 border-green-100"
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 bg-gray-900 text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to write your own story?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                        Join thousands of others who are actively working towards a happier, healthier life.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-10 py-5 rounded-full hover:scale-105 transition-transform">
                        Get Started Now <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function StoryCard({ category, content, author, role, color }: { category: string, content: string, author: string, role: string, color: string }) {
    return (
        <div className={`p-8 rounded-3xl border ${color} hover:-translate-y-1 transition-transform duration-300`}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-4">{category}</div>
            <Quote className="w-8 h-8 text-gray-300 mb-4 fill-current" />
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
                &quot;{content}&quot;
            </p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">
                    {author[0]}
                </div>
                <div>
                    <div className="font-bold text-gray-900 text-sm">{author}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                </div>
            </div>
        </div>
    );
}
