"use client";

import { motion } from "framer-motion";

export default function ScientificLoader() {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 p-12 relative overflow-hidden">
            {/* Background Geometric Elements */}
            <div className="absolute inset-0 -z-10 opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-blue-600 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-violet-600 rounded-full animate-pulse" />
            </div>

            <div className="relative w-48 h-48">
                {/* Central Nucleus */}
                <motion.div
                    className="absolute inset-0 m-auto w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.8)]"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Orbit 1: Vertical */}
                <motion.div
                    className="absolute inset-0 border border-blue-600/20 rounded-full"
                    style={{ borderRadius: '50% 50% 50% 50% / 10% 10% 90% 90%' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                </motion.div>

                {/* Orbit 2: 45 Degrees */}
                <motion.div
                    className="absolute inset-0 border border-violet-600/20 rounded-full"
                    style={{ transform: 'rotate(45deg)', borderRadius: '50% 50% 50% 50% / 10% 10% 90% 90%' }}
                    animate={{ rotate: 405 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-600 rounded-full" />
                </motion.div>

                {/* Orbit 3: -45 Degrees */}
                <motion.div
                    className="absolute inset-0 border border-indigo-200/20 rounded-full"
                    style={{ transform: 'rotate(-45deg)', borderRadius: '50% 50% 50% 50% / 10% 10% 90% 90%' }}
                    animate={{ rotate: 315 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full" />
                </motion.div>

                {/* Floating Neural Nodes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    {[...Array(6)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx={50 + 35 * Math.cos((i * 2 * Math.PI) / 6)}
                            cy={50 + 35 * Math.sin((i * 2 * Math.PI) / 6)}
                            r="1.5"
                            fill="currentColor"
                            className="text-blue-600/40"
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.3,
                                repeat: Infinity,
                            }}
                        />
                    ))}
                    {/* Connection Lines */}
                    {[...Array(6)].map((_, i) => (
                        <motion.line
                            key={`line-${i}`}
                            x1={50 + 15 * Math.cos((i * 2 * Math.PI) / 6)}
                            y1={50 + 15 * Math.sin((i * 2 * Math.PI) / 6)}
                            x2={50 + 35 * Math.cos((i * 2 * Math.PI) / 6)}
                            y2={50 + 35 * Math.sin((i * 2 * Math.PI) / 6)}
                            stroke="currentColor"
                            strokeWidth="0.2"
                            className="text-blue-600/20"
                            animate={{
                                opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.2,
                                repeat: Infinity,
                            }}
                        />
                    ))}
                </svg>
            </div>

            <div className="text-center">
                <motion.h2
                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 tracking-widest uppercase"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Processing Thoughts
                </motion.h2>
                <div className="flex justify-center mt-2 space-x-1">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-blue-600/40 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
