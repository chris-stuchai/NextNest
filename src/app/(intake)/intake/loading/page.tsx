"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
      <OrbitalSpinner />
    </div>
  );
}

function OrbitalSpinner() {
  return (
    <div className="relative h-28 w-28">
      {/* Outer ring */}
      <div className="absolute inset-0 animate-orbit rounded-full border-2 border-primary/15">
        <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary shadow-lg shadow-primary/40" />
      </div>
      {/* Middle ring */}
      <div className="absolute inset-3 animate-orbit-reverse rounded-full border-2 border-primary/10">
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary/60" />
      </div>
      {/* Inner ring */}
      <div className="absolute inset-6 animate-orbit rounded-full border-2 border-primary/5" style={{ animationDuration: "2s" }}>
        <div className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary/40" />
      </div>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
      </div>
    </div>
  );
}

/** Premium loading screen with orbital animation and crossfading messages. */
function PlanLoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8 + 2;
      });
    }, 400);

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
          setProgress(100);
          await new Promise((resolve) => setTimeout(resolve, 800));
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-10"
      >
        <OrbitalSpinner />

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-semibold"
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>

          <p className="text-sm text-muted-foreground">
            Crafting your personalized relocation plan
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-auto w-64 space-y-2">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            {Math.min(Math.round(progress), 100)}% complete
          </p>
        </div>
      </motion.div>
    </div>
  );
}
