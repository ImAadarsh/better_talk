"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ScientificLoader() {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative">
                {/* Rotating Gradient Ring */}
                <motion.div
                    className="absolute -inset-6 rounded-full border border-blue-500/10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Secondary Pulse Ring */}
                <motion.div
                    className="absolute -inset-6 rounded-full border border-violet-500/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Logo Container */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        rotateY: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-500/10 flex items-center justify-center p-5 border border-white/50"
                >
                    <Image
                        src="/better-talk-logo.png"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                </motion.div>
            </div>

            <div className="mt-10 text-center space-y-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32 mx-auto"
                />
                <h3 className="text-sm font-bold text-gray-900 tracking-[0.2em] uppercase opacity-70">
                    Searching for clarity...
                </h3>
            </div>
        </div>
    );
}
