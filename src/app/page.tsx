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
            window.location.href = "/groups";
          } else {
            setView("onboarding");
          }
        } catch (error) {
          console.error("Failed to check user:", error);
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
    return <OnboardingScreen onComplete={() => (window.location.href = "/groups")} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-sand">
      <Loader2 className="w-10 h-10 text-forest-green animate-spin" />
    </div>
  );
}
