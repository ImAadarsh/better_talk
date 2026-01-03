"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Users, Stethoscope, Calendar, Clock, LayoutDashboard, GraduationCap, Video } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const router = useRouter();

    const isGroupDetail = /^\/groups\/\d+$/.test(pathname);

    useEffect(() => {
        if (session?.user && (session.user as any).role === 'mentor' && !(session.user as any).is_verified) {
            // If unverified Therapist is NOT on therapist page AND NOT on schedule page (allow schedule? maybe not until verified)
            // Actually, the requirements imply they can login but only see status if unverified.
            // If verified, they have access to dashboard features.
            // For now, if unverified, keep redirecting to /therapist
            const isTherapistPage = pathname.startsWith('/therapist');
            if (!isTherapistPage) {
                router.replace('/therapist');
            }
        }
    }, [session, pathname, router]);


    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    // Define Navigation Items
    let navItems = [
        { label: "Community", href: "/groups", icon: "/icons/user_section/community.png" },
        { label: "Therapists", href: "/therapists", icon: "/icons/user_section/therapist.png" },
        { label: "Sessions", href: "/sessions", icon: "/icons/user_section/session.png" },
        { label: "Profile", href: "/profile", icon: "/icons/user_section/profile.png" },
    ];

    // If Mentor (Verified), Override Items
    if (session?.user && (session.user as any).role === 'mentor' && (session.user as any).is_verified) {
        navItems = [
            { label: "Community", href: "/groups", icon: "/icons/user_section/community.png" },
            { label: "Sessions", href: "/sessions", icon: "/icons/user_section/session.png" },
            { label: "Profile", href: "/profile", icon: "/icons/user_section/profile.png" },
            { label: "Schedule", href: "/therapist/schedule", icon: "/icons/user_section/session.png" },
        ];
    }

    // Continue rendering...
    return (
        <div className="flex h-screen bg-brand-bg md:overflow-hidden overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100">
                <div className="p-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-blue-600 bg-clip-text text-transparent">
                        BetterTalk
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25 translate-x-1"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                                    }`}
                            >
                                <div className="w-5 h-5 relative">
                                    <Image
                                        src={item.icon}
                                        alt={item.label}
                                        width={20}
                                        height={20}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                            {session?.user?.image ? (
                                <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                            ) : (
                                <User className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                            <button
                                onClick={() => signOut()}
                                className="text-xs text-red-500 hover:underline flex items-center gap-1"
                            >
                                <LogOut className="w-3 h-3" /> Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 relative bg-brand-bg md:overflow-hidden overflow-x-hidden ${isGroupDetail ? 'overflow-y-hidden h-full flex flex-col' : 'overflow-y-auto'}`}>
                {/* Mobile Header - Hidden on Group Detail */}
                {!isGroupDetail && (
                    <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/better-talk-logo.png"
                                alt="BetterTalk"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                            />
                            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-primary to-blue-600 bg-clip-text text-transparent">
                                BetterTalk
                            </h1>
                        </div>

                        {/* Mobile Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="relative w-9 h-9 rounded-full overflow-hidden border border-brand-primary/20"
                            >
                                {session?.user?.image ? (
                                    <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
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
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium"
                                        >
                                            <User className="w-5 h-5 text-brand-primary" /> Profile
                                        </Link>
                                        <Link
                                            href="/therapists"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium"
                                        >
                                            <Stethoscope className="w-5 h-5 text-brand-primary" /> Book A Session
                                        </Link>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <button
                                            onClick={() => signOut()}
                                            className="px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-500 font-medium w-full text-left"
                                        >
                                            <LogOut className="w-5 h-5" /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className={`h-full ${isGroupDetail ? 'p-0' : 'p-4 md:p-8 max-w-5xl mx-auto pb-40 md:pb-8'}`}>
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe z-30 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${active ? "text-brand-primary" : "text-gray-400"
                                    }`}
                            >
                                <div className="w-5 h-5 relative">
                                    <Image
                                        src={item.icon}
                                        alt={item.label}
                                        width={20}
                                        height={20}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div >
    );
}
