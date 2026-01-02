"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, Clock, User, LogOut, Menu, X, GraduationCap, Users } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

interface TherapistLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/therapist/dashboard", icon: LayoutDashboard },
    { label: "Community", href: "/therapist/community", icon: Users },
    { label: "Schedule", href: "/therapist/schedule", icon: Calendar },
    { label: "Sessions", href: "/therapist/sessions", icon: Clock },
    { label: "Profile", href: "/therapist/profile", icon: User },
];

export default function TherapistLayout({ children }: TherapistLayoutProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <div className="flex h-screen bg-blue-50/30 md:overflow-hidden overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <img src="/better-talk-logo.png" alt="Logo" className="object-contain w-full h-full" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            Therapist<span className="text-blue-600">Portal</span>
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 translate-x-1"
                                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-400 group-hover:text-blue-600"}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white">
                            {session?.user?.image ? (
                                <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                            ) : (
                                <User className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                            <button
                                onClick={() => signOut({ callbackUrl: '/therapist/login' })}
                                className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-0.5"
                            >
                                <LogOut className="w-3 h-3" /> Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <img src="/better-talk-logo.png" alt="Logo" className="object-contain w-full h-full" />
                        </div>
                        <span className="font-bold text-gray-900">Therapist Portal</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute inset-0 z-10 bg-white animate-fade-in pt-16 px-4">
                        <nav className="space-y-2 mt-4">
                            {NAV_ITEMS.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${active
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            <button
                                onClick={() => signOut({ callbackUrl: '/therapist/login' })}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl text-red-500 hover:bg-red-50 w-full mt-4"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
