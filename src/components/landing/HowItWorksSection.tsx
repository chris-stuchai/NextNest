"use client";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { MessageSquareText, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquareText,
    title: "Tell us about your move",
    description:
      "Answer 10 quick questions about where you're going, when, and what matters most to you.",
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Get your personalized plan",
    description:
      "We generate a custom timeline, budget breakdown, and priority list based on your answers.",
    color: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Track your progress",
    description:
      "Check off milestones, watch your readiness score climb, and receive smart reminders as you go.",
    color: "from-primary to-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

/** Three-step explanation with connected timeline and scroll-triggered reveal. */
export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal>
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              From overwhelmed to organized
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Three simple steps. Under 3 minutes. A complete relocation plan.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer
          className="relative mt-20 grid gap-8 sm:gap-12 lg:grid-cols-3 lg:gap-8"
          staggerDelay={0.15}
        >
          {/* Connecting line (desktop only) */}
          <div className="absolute top-16 left-[16.67%] right-[16.67%] hidden lg:block">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {steps.map((step, index) => (
            <StaggerItem key={step.number}>
              <div className="relative flex flex-col items-center text-center">
                {/* Step number badge */}
                <div className="relative mb-6">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white text-xl font-bold shadow-lg transition-transform duration-300 hover:scale-105`}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-bold shadow-sm ring-2 ring-border">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
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
