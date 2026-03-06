"use client";

import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations/ScrollReveal";

const metrics = [
  {
    value: 3,
    suffix: " min",
    label: "Average setup time",
    detail: "Answer a few questions and your plan is ready",
  },
  {
    value: 50,
    suffix: "+",
    label: "Milestones tracked",
    detail: "Every task mapped from today to move day",
  },
  {
    value: 100,
    suffix: "%",
    label: "Free to use",
    detail: "No credit card, no trial — just your plan",
  },
];

/** Animated product metrics bar — real facts, not hollow social proof. */
export function MetricsSection() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal>
          <StaggerContainer
            className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-border"
            staggerDelay={0.12}
          >
            {metrics.map((metric) => (
              <StaggerItem key={metric.label}>
                <div className="flex flex-col items-center px-6 py-8 text-center sm:py-4">
                  <span className="text-4xl font-bold tracking-tight">
                    <AnimatedCounter
                      target={metric.value}
                      duration={1.2}
                      suffix={metric.suffix}
                    />
                  </span>
                  <span className="mt-2 text-sm font-semibold">{metric.label}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{metric.detail}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ScrollReveal>
      </div>
    </section>
  );
}
