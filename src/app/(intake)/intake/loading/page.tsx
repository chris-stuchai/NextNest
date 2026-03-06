"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const loadingMessages = [
  "Mapping your timeline...",
  "Aligning your milestones...",
  "Calculating your budget...",
  "Building your NextNest plan...",
  "You're closer than you think...",
];

/** Wraps the loading content in a Suspense boundary required by useSearchParams. */
export default function PlanLoadingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlanLoadingContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    </div>
  );
}

/** Animated loading screen shown while the relocation plan is being generated. */
function PlanLoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!planId) {
      router.push("/intake");
      return;
    }

    async function generatePlan() {
      try {
        const response = await fetch("/api/plan/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });

        if (response.ok) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      }
    }

    generatePlan();
  }, [planId, router]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="text-center space-y-8">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-primary/10 border-b-primary/60" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>

        <div className="space-y-3">
          <p
            key={messageIndex}
            className="text-xl font-medium animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-sm text-muted-foreground">
            This takes just a moment
          </p>
        </div>
      </div>
    </div>
  );
}
