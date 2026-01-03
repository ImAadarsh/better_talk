"use client";

import { useEffect, useState } from "react";
import { Quote, ArrowRight, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import ScientificLoader from "@/components/ScientificLoader";

interface Story {
    id: number;
    author_name: string;
    author_role: string;
    title: string;
    content: string;
    rating: number;
}

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStories() {
            try {
                const res = await fetch("/api/stories");
                if (res.ok) {
                    setStories(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch stories", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStories();
    }, []);

    const colors = [
        "bg-blue-50 border-blue-100",
        "bg-purple-50 border-purple-100",
        "bg-rose-50 border-rose-100",
        "bg-amber-50 border-amber-100",
        "bg-slate-50 border-slate-100",
        "bg-green-50 border-green-100"
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <PublicNavbar />

            {/* Hero */}
            <section className="py-20 bg-warm-sand/30 text-center px-6 mt-16">
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
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center h-64 items-center">
                            <ScientificLoader />
                        </div>
                    ) : stories.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                            <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No stories yet</h3>
                            <p className="text-gray-500">Be the first to share your journey!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {stories.map((story, index) => (
                                <StoryCard
                                    key={story.id}
                                    category={story.title || "Success Story"}
                                    content={story.content}
                                    author={story.author_name}
                                    role={story.author_role}
                                    color={colors[index % colors.length]}
                                />
                            ))}
                        </div>
                    )}
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
        <div className={`p-8 rounded-3xl border ${color} hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col`}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-4">{category}</div>
            <Quote className="w-8 h-8 text-gray-300 mb-4 fill-current" />
            <p className="text-gray-700 text-lg leading-relaxed mb-8 flex-1">
                &quot;{content}&quot;
            </p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs uppercase shrink-0">
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
