"use client";

import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";

export default function Home() {
  const [view, setView] = useState<"login" | "onboarding" | "dashboard">("login");

  if (view === "login") {
    return <LoginScreen onLogin={() => setView("onboarding")} />;
  }

  if (view === "onboarding") {
    return <OnboardingScreen onComplete={() => setView("dashboard")} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-fade-in bg-warm-sand">
      <h1 className="text-4xl font-bold text-forest-green mb-4">Dashboard</h1>
      <p className="text-gray-600">You are all set! Welcome to Better Talk.</p>
    </div>
  );
}
