"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<"loading" | "login" | "onboarding" | "dashboard">("loading");

  useEffect(() => {
    async function checkUser() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        setView("login");
        return;
      }

      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch("/api/user/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          const data = await res.json();

          if (data.exists) {
            setView("dashboard");
          } else {
            setView("onboarding");
          }
        } catch (error) {
          console.error("Failed to check user:", error);
          // Fallback to onboarding on error? Or show error screen?
          // For now, let's assume if check fails, we might need to retry or default to something safe.
          setView("onboarding");
        }
      }
    }

    checkUser();
  }, [status, session]);

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-sand">
        <Loader2 className="w-10 h-10 text-forest-green animate-spin" />
      </div>
    );
  }

  if (view === "login") {
    return <LoginScreen />;
  }

  if (view === "onboarding") {
    // When onboarding is complete, we should re-check or just switch to dashboard
    return <OnboardingScreen onComplete={() => setView("dashboard")} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-fade-in bg-warm-sand">
      {/* Placeholder Dashboard */}
      <h1 className="text-4xl font-bold text-forest-green mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {session?.user?.name || "Friend"}!</p>
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <p className="text-sm text-gray-500">Logged in as {session?.user?.email}</p>
      </div>
    </div>
  );
}
