"use client";

import AdminSidebar from "./AdminSidebar";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import ScientificLoader from "../ScientificLoader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname === "/adx/login";

    useEffect(() => {
        if (!isLoginPage) {
            if (status === "unauthenticated") {
                router.push("/adx/login");
            } else if (status === "authenticated" && (session.user as any).role !== 'admin') {
                router.push("/");
            }
        }
    }, [status, session, router, isLoginPage]);

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <ScientificLoader />
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!session || (session.user as any).role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="lg:ml-72 min-h-screen">
                <div className="p-4 md:p-8 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
