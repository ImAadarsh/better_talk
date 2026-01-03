"use client";

import TherapistLayout from "@/components/TherapistLayout";
import CommunityGroupsList from "@/components/CommunityGroupsList";

export default function TherapistCommunityPage() {
    return (
        <TherapistLayout>
            <div className="space-y-4 md:space-y-8 animate-fade-in pb-20">
                <div className="mb-6 md:mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Communities</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Connect with other professionals and patients.</p>
                </div>

                <CommunityGroupsList basePath="/therapist/community" />
            </div>
        </TherapistLayout>
    );
}
