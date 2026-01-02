"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <Image src="/better-talk-logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain brightness-0 invert" />
                    <span className="text-xl font-bold tracking-tight">BetterTalk.</span>
                </div>

                <div className="text-gray-400 text-sm text-center md:text-right">
                    <p>&copy; 2026 Better Talk. All rights reserved.</p>
                    <p className="mt-1">
                        Designed & Developed By <a href="https://endeavourdigital.in" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-white transition-colors font-medium">Endeavour Digital</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
