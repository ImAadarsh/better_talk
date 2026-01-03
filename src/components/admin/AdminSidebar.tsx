"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarCheck,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    FolderTree,
    Clock,
    Globe,
    Shield,
    HelpCircle
} from "lucide-react";
import Image from "next/image";

import { useState } from "react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Dashboard", href: "/adx", icon: LayoutDashboard },
    { name: "Users", href: "/adx/users", icon: Users },
    { name: "Therapists", href: "/adx/therapists", icon: Stethoscope },
    { name: "Plan Management", href: "/adx/plans", icon: FolderTree },
    { name: "Slot Management", href: "/adx/slots", icon: Clock },
    { name: "Bookings", href: "/adx/bookings", icon: CalendarCheck },
    { name: "Communities", href: "/adx/groups", icon: Globe },
    { name: "Moderation", href: "/adx/moderation", icon: Shield },
    { name: "Stories", href: "/adx/stories", icon: Settings }, // Using Settings temporarily or import another icon
    { name: "FAQs", href: "/adx/faqs", icon: HelpCircle },
    { name: "Contact Inquiries", href: "/adx/messages", icon: MessageSquare },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-100"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-100 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="flex flex-col h-full p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Image src="/better-talk-logo.png" alt="Logo" width={24} height={24} className="object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">BetterTalk</h2>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-md w-fit">Administrator</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all
                                        ${isActive
                                            ? "bg-gray-900 text-white shadow-xl shadow-gray-900/10"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-100">

                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all w-full mb-4"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>

                        <div className="px-4 py-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">
                            Developed By <br />
                            <span className="text-gray-400"><a href="https://endeavourdigital.in" target="_blank">Endeavour Digital</a></span>
                        </div>
                    </div>
                </div>
            </aside>

        </>
    );
}
