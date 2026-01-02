"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "About", href: "/about" },
        { name: "Stories", href: "/stories" },
        { name: "Contact", href: "/contact" },
        { name: "For Therapists", href: "/therapist" },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm" : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.img
                            whileHover={{ rotate: -10 }}
                            src="/better-talk-logo.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-brand-primary transition-colors">BetterTalk.</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="hover:text-brand-primary transition-colors relative group">
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-brand-primary transition-colors">
                            Log in
                        </Link>
                        <Link href="/register" className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-gray-900" onClick={() => setMobileMenuOpen(true)}>
                        <Menu />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "tween" }}
                        className="fixed inset-0 z-[60] bg-white p-6 flex flex-col md:hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xl font-bold text-gray-900">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6 text-lg font-medium text-gray-900">
                            {navLinks.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-gray-100" />
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                            <Link href="/register" className="text-brand-primary" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
