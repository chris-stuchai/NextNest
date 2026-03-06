"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/** Animated mockup showing AI analyzing inputs and generating a plan. */
function AiMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const inputs = [
    { label: "Moving to", value: "Austin, TX" },
    { label: "Move date", value: "June 15" },
    { label: "Household", value: "Family of 4" },
  ];

  const outputs = [
    "12-week personalized timeline",
    "Estimated budget: $5,300",
    "52 milestones created",
  ];

  return (
    <div ref={ref} className="relative rounded-2xl border bg-card p-6 shadow-xl shadow-black/5">
      {/* Input side */}
      <div className="mb-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your answers
        </p>
        <div className="space-y-2">
          {inputs.map((input, i) => (
            <motion.div
              key={input.label}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.35 }}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">{input.label}</span>
              <span className="text-xs font-medium">{input.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Processing indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : undefined}
        transition={{ delay: 0.6 }}
        className="my-4 flex items-center gap-2"
      >
        <div className="h-px flex-1 bg-border" />
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
          AI Engine
        </span>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      {/* Output side */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your plan
        </p>
        <div className="space-y-2">
          {outputs.map((output, i) => (
            <motion.div
              key={output}
              initial={{ opacity: 0, x: 10 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.35 }}
              className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium">{output}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Section explaining the AI-powered plan generation. */
export function AiSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <ScrollReveal direction="left" className="flex-1 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              AI-powered
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A plan built for your life, not a generic checklist
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Our AI engine analyzes your move date, destination, household size, and
              priorities to create a fully personalized relocation plan — complete with
              timeline, budget estimates, and a prioritized task list.
            </p>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Whether you&apos;re moving across town or across the country, renting
              or buying, solo or with family — the plan adapts to you.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" className="w-full flex-1 max-w-md">
            <AiMockup />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
