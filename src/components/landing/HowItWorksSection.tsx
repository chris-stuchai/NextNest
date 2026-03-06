"use client";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

/** Mini intake question card — shows the conversational intake UI. */
function IntakePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="rounded-xl border bg-card p-4 shadow-lg shadow-black/5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.3 }}
        className="mb-3"
      >
        <p className="text-xs font-medium text-foreground">Where are you moving to?</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.5 }}
        className="mb-3 grid grid-cols-2 gap-2"
      >
        {["New city", "Same city", "New state", "International"].map((opt, i) => (
          <div
            key={opt}
            className={`rounded-lg border px-3 py-2 text-center text-xs ${
              i === 2
                ? "border-primary bg-primary/5 font-medium text-primary"
                : "text-muted-foreground"
            }`}
          >
            {opt}
          </div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : undefined}
        transition={{ delay: 0.7 }}
        className="flex justify-end"
      >
        <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Next <ArrowRight className="h-3 w-3" />
        </div>
      </motion.div>
    </div>
  );
}

/** Mini loading/generating spinner preview. */
function GeneratingPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="flex flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-lg shadow-black/5">
      <div className="relative mb-4 h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={isInView ? { rotate: 360 } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary" />
        </motion.div>
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-primary/30"
          animate={isInView ? { rotate: -360 } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary/70" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary/20" />
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : undefined}
        transition={{ delay: 0.4 }}
        className="text-xs font-medium text-muted-foreground"
      >
        Building your plan...
      </motion.p>
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: "80%" } : undefined}
        transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
        className="mt-3 h-1 rounded-full bg-primary/40"
      />
    </div>
  );
}

/** Mini dashboard overview preview with readiness score. */
function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference - (0.72 * circumference);

  return (
    <div ref={ref} className="rounded-xl border bg-card p-4 shadow-lg shadow-black/5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold">Your Dashboard</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          On track
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted/50" />
            <motion.circle
              cx="24" cy="24" r="20" strokeWidth="3" fill="none"
              className="text-primary"
              stroke="currentColor"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset: dashOffset } : undefined}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute text-[10px] font-bold">72%</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {["Movers booked", "Mail forwarded", "Utilities set up"].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: 6 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 className={`h-3 w-3 ${i < 2 ? "text-primary" : "text-muted-foreground/30"}`} />
              <span className={`text-[10px] ${i < 2 ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {t}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Three-step explanation with miniature UI previews for each step. */
export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal>
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From overwhelmed to organized
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Three simple steps. Under 3 minutes. A complete relocation plan.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer
          className="relative mt-20 grid gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-8"
          staggerDelay={0.15}
        >
          {/* Connecting line (desktop only) */}
          <div className="absolute top-[140px] left-[16.67%] right-[16.67%] hidden lg:block">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {[
            {
              number: 1,
              title: "Tell us about your move",
              description: "Answer a few quick questions about where, when, and what matters most.",
              preview: <IntakePreview />,
            },
            {
              number: 2,
              title: "We build your plan",
              description: "Our engine generates a custom timeline, budget, and priority list.",
              preview: <GeneratingPreview />,
            },
            {
              number: 3,
              title: "Track your progress",
              description: "Check off milestones, watch your readiness score climb, and stay on track.",
              preview: <DashboardPreview />,
            },
          ].map((step) => (
            <StaggerItem key={step.number}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6 w-full max-w-[260px]">
                  {step.preview}
                  <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
