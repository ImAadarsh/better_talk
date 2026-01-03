"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "FAQ", href: "/faq" },
    ];

    return (
        <>
            {/* Desktop & Mobile Header */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/better-talk-logo.png"
                                alt="BetterTalk Logo"
                                fill
                                className="object-contain transition-transform group-hover:scale-110"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Better<span className="text-brand-primary">Talk</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-600 hover:text-brand-primary font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="bg-brand-gradient text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden w-10 h-10 bg-brand-gradient rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Slider - Bottom Sheet */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        />

                        {/* Bottom Sheet Menu */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[2rem] shadow-2xl max-h-[80vh] overflow-hidden"
                        >
                            {/* Curved Top Border Decoration */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-purple-500 to-brand-primary" />

                            {/* Handle Bar */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Menu Content */}
                            <div className="px-6 py-6 space-y-2 overflow-y-auto max-h-[calc(80vh-80px)]">
                                {/* Logo Section */}
                                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src="/better-talk-logo.png"
                                            alt="BetterTalk Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">BetterTalk</h2>
                                        <p className="text-xs text-gray-500">Your mental wellness companion</p>
                                    </div>
                                </div>

                                {/* Navigation Links */}
                                <div className="space-y-1 py-4">
                                    {navLinks.map((link, index) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="pt-4"
                                >
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full bg-brand-gradient text-white text-center px-6 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </motion.div>

                                {/* Additional Info */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="pt-6 text-center text-sm text-gray-500"
                                >
                                    <p>Need help? <Link href="/contact" className="text-brand-primary font-medium">Contact us</Link></p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
