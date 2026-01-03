"use client";

import OnboardingScreen from "@/components/OnboardingScreen";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    return <OnboardingScreen onComplete={() => router.push("/groups")} />;
}
