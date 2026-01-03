"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { ChevronDown, Plus, Minus, Search, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';

export default function FAQPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch("/api/public/faqs");
                const data = await res.json();
                setFaqs(data);
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />

            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wide uppercase">
                        <MessageCircle className="w-4 h-4" />
                        Help Center
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Questions</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Everything you need to know about BetterTalk features, therapy sessions, and community guidelines.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-12 max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* FAQ List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredFaqs.length > 0 ? (
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={faq.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group rounded-3xl transition-all duration-300 ${openIndex === index
                                    ? "bg-white ring-1 ring-gray-200 shadow-xl shadow-blue-900/5"
                                    : "bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50"
                                    }`}
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full text-left px-8 py-6 flex items-center justify-between gap-4"
                                >
                                    <span className={`font-bold text-lg transition-colors ${openIndex === index ? "text-blue-600" : "text-gray-900"
                                        }`}>
                                        {faq.question}
                                    </span>
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index
                                        ? "bg-blue-600 text-white rotate-180"
                                        : "bg-gray-200 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                                        }`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-8 pb-8 pt-0 text-gray-600 leading-relaxed text-lg">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No matching questions found.</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                <div className="mt-16 text-center bg-gray-50 rounded-[2.5rem] p-8 md:p-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-gray-900 rounded-2xl hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/10 hover:-translate-y-0.5"
                    >
                        Get in touch
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
