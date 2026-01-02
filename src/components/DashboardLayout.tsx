"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, LayoutDashboard, Menu, X, LogOut, Home, GraduationCap, Clock, User } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { label: "Community", href: "/groups", icon: Users },
    { label: "Therapists", href: "/therapists", icon: GraduationCap },
    { label: "Sessions", href: "/sessions", icon: Clock },
    { label: "Profile", href: "/profile", icon: LayoutDashboard },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const router = useRouter();

    const isGroupDetail = /^\/groups\/\d+$/.test(pathname);

    useEffect(() => {
        if (session?.user && (session.user as any).role === 'mentor' && !(session.user as any).is_verified) {
            router.push('/therapist');
        }
    }, [session, router]);

    // Continue rendering...
    return (
        <div className="flex h-screen bg-warm-sand overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-soft-clay/30">
                <div className="p-6 flex items-center gap-3">
                    <div className="relative w-8 h-8">
                        <Image src="/better-talk-logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-semibold text-xl text-forest-green tracking-tight">Better Talk</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                    : "text-gray-500 hover:bg-white/50 hover:text-brand-primary"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-soft-clay/30">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-soft-clay/20">
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
            <main className={`flex-1 relative bg-warm-sand overflow-x-hidden ${isGroupDetail ? 'overflow-y-hidden h-full flex flex-col' : 'overflow-y-auto'}`}>
                {/* Mobile Header - Hidden on Group Detail */}
                {!isGroupDetail && (
                    <div className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-soft-clay/30 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image src="/better-talk-logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <span className="font-semibold text-lg text-forest-green">Better Talk</span>
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
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-soft-clay/50 z-40 overflow-hidden animate-fade-in flex flex-col py-2">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="px-4 py-3 hover:bg-brand-bg flex items-center gap-3 text-gray-700 font-medium"
                                        >
                                            <User className="w-5 h-5 text-brand-primary" /> Profile
                                        </Link>
                                        <Link
                                            href="/therapists"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="px-4 py-3 hover:bg-brand-bg flex items-center gap-3 text-gray-700 font-medium"
                                        >
                                            <GraduationCap className="w-5 h-5 text-brand-primary" /> Book A Session
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
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-soft-clay/30 pb-safe z-30 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center h-16">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${isActive ? "text-brand-primary" : "text-gray-400"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
