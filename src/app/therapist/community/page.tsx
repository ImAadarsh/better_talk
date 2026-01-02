"use client";

import TherapistLayout from "@/components/TherapistLayout";
import CommunityGroupsList from "@/components/CommunityGroupsList";

export default function TherapistCommunityPage() {
    return (
        <TherapistLayout>
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Communities</h1>
                        <p className="text-gray-500 mt-2 text-lg">Connect with other professionals and patients.</p>
                    </div>
                </div>

                <CommunityGroupsList basePath="/therapist/community" />
            </div>
        </TherapistLayout>
    );
}
