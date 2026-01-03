"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Clock, User, LogOut, Users, Menu, X, ChevronDown, Bell } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

interface TherapistLayoutProps {
    children: React.ReactNode;
    hideMobileHeader?: boolean;
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/therapist/dashboard", icon: "/icons/3d/dashboard.png" },
    { label: "Community", href: "/therapist/community", icon: "/icons/3d/community.png" },
    { label: "Schedule", href: "/therapist/schedule", icon: "/icons/3d/schedule.png" },
    { label: "Sessions", href: "/therapist/sessions", icon: "/icons/3d/sessions.png" },
    { label: "Profile", href: "/therapist/profile", icon: "/icons/3d/profile.png" },
];

export default function TherapistLayout({ children, hideMobileHeader = false }: TherapistLayoutProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <div className="flex h-screen bg-blue-50/30 md:overflow-hidden overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image src="/better-talk-logo.png" alt="Logo" width={40} height={40} className="object-contain w-full h-full" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            BetterTalk <span className="text-blue-600">Therapists</span>
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
                                <div className="relative w-7 h-7">
                                    <Image
                                        src={item.icon as string}
                                        alt={item.label}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
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
                {!hideMobileHeader && (
                    <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8">
                                <Image src="/better-talk-logo.png" alt="Logo" width={32} height={32} className="object-contain w-full h-full" />
                            </div>
                            <span className="font-bold text-gray-900">BetterTalk <span className="text-blue-600">Therapists</span></span>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="relative w-9 h-9 rounded-full overflow-hidden border border-blue-200 ring-2 ring-blue-50"
                            >
                                {session?.user?.image ? (
                                    <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </button>

                            {isProfileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-fade-in flex flex-col py-2">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                                        </div>
                                        <Link
                                            href="/therapist/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium"
                                        >
                                            <User className="w-5 h-5 text-blue-500" /> My Profile
                                        </Link>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/therapist/login' })}
                                            className="px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-500 font-medium w-full text-left"
                                        >
                                            <LogOut className="w-5 h-5" /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe z-30 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-around items-center h-16">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${active ? "text-blue-600" : "text-gray-400"
                                        }`}
                                >
                                    <div className={`relative transition-all duration-300 ${active ? "w-8 h-8 -translate-y-2 drop-shadow-lg" : "w-6 h-6 grayscale opacity-60"}`}>
                                        <Image
                                            src={item.icon as string}
                                            alt={item.label}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className={`text-[10px] font-bold transition-all ${active ? "text-blue-600 translate-y-1" : "text-gray-400"}`}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
