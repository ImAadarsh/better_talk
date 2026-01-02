import DashboardLayout from "@/components/DashboardLayout";
import { GraduationCap } from "lucide-react";

export default function TherapistsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-4">
                    <GraduationCap className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Find a Therapist</h1>
                <p className="text-gray-500 max-w-md">
                    Connect with experienced therapists who can guide you through your journey.
                    Book one-on-one sessions for personalized support.
                </p>
                <div className="mt-8 p-4 bg-white rounded-xl border border-brand-border text-sm text-gray-500">
                    Coming Soon
                </div>
            </div>
        </DashboardLayout>
    );
}
