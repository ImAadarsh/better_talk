"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Clock } from "lucide-react";

export default function SessionsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-4">
                    <Clock className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
                <p className="text-gray-500 max-w-md">
                    Manage your upcoming therapy sessions and view past history.
                </p>
                <div className="mt-8 p-4 bg-white rounded-xl border border-brand-border text-sm text-gray-500">
                    Coming Soon
                </div>
            </div>
        </DashboardLayout>
    );
}
