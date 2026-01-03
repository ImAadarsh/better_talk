"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import LandingPage from "@/components/LandingPage";
import ScientificLoader from "@/components/ScientificLoader";

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<"loading" | "landing" | "onboarding" | "dashboard">("loading");

  useEffect(() => {
    async function checkUser() {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        setView("landing");
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
            // Check for Admin role
            if ((session.user as any).role === 'admin') {
              window.location.href = "/adx";
            } else if ((session.user as any).role === 'mentor') {
              window.location.href = "/therapist/dashboard";
            } else {
              window.location.href = "/groups";
            }
          } else {
            window.location.href = "/onboarding";
          }
        } catch (error) {
          console.error("Failed to check user:", error);
          window.location.href = "/onboarding";
        }
      }
    }

    checkUser();
  }, [status, session]);

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-sand">
        <ScientificLoader />
      </div>
    );
  }


  if (view === "landing") {
    return <LandingPage />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-sand">
      <ScientificLoader />
    </div>
  );
}
