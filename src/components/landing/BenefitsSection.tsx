"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";

/** Mini timeline product mockup rendered with CSS. */
function TimelineMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const milestones = [
    { label: "Research neighborhoods", done: true, week: "Week 1" },
    { label: "Get mortgage pre-approval", done: true, week: "Week 2" },
    { label: "Schedule movers", done: false, week: "Week 4" },
    { label: "Set up utilities", done: false, week: "Week 6" },
  ];

  return (
    <div ref={ref} className="relative rounded-2xl border bg-card p-6 shadow-xl shadow-black/5">
      <div className="mb-5 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Your Timeline</h4>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          4 of 12 done
        </span>
      </div>
      <div className="space-y-0">
        {milestones.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -12 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
            className="flex items-start gap-3 py-3"
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  m.done
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-muted-foreground/20 bg-background"
                }`}
              >
                {m.done && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              {i < milestones.length - 1 && (
                <div className="absolute top-6 h-9 w-px bg-border" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${m.done ? "text-foreground" : "text-muted-foreground"}`}>
                {m.label}
              </p>
              <p className="text-xs text-muted-foreground/60">{m.week}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Mini budget breakdown product mockup rendered with CSS. */
function BudgetMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const categories = [
    { label: "Moving company", amount: "$2,400", pct: 45, color: "bg-primary" },
    { label: "Security deposit", amount: "$1,800", pct: 34, color: "bg-primary/60" },
    { label: "Utility setup", amount: "$350", pct: 7, color: "bg-primary/40" },
    { label: "Other expenses", amount: "$750", pct: 14, color: "bg-primary/25" },
  ];

  return (
    <div ref={ref} className="relative rounded-2xl border bg-card p-6 shadow-xl shadow-black/5">
      <div className="mb-5 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Budget Overview</h4>
        <span className="text-2xl font-bold tracking-tight">$5,300</span>
      </div>
      <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-muted">
        {categories.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${c.pct}%` } : undefined}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" }}
            className={`${c.color} ${i === 0 ? "rounded-l-full" : ""} ${i === categories.length - 1 ? "rounded-r-full" : ""}`}
          />
        ))}
      </div>
      <div className="space-y-3">
        {categories.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
              <span className="text-sm text-muted-foreground">{c.label}</span>
            </div>
            <span className="text-sm font-medium">{c.amount}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Readiness score ring + checklist product mockup. */
function ReadinessMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const tasks = [
    { label: "Forward mail to new address", done: true },
    { label: "Transfer utilities", done: true },
    { label: "Update driver's license", done: false },
  ];

  const score = 68;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="relative rounded-2xl border bg-card p-6 shadow-xl shadow-black/5">
      <h4 className="mb-5 text-sm font-semibold">Move Readiness</h4>
      <div className="flex items-center gap-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/50" />
            <motion.circle
              cx="48" cy="48" r="40" strokeWidth="6" fill="none"
              className="text-primary"
              stroke="currentColor"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset: dashOffset } : undefined}
              transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <motion.span
            className="absolute text-xl font-bold"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : undefined}
            transition={{ delay: 0.8 }}
          >
            {score}%
          </motion.span>
        </div>
        <div className="flex-1 space-y-2.5">
          {tasks.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, x: 8 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.35 }}
              className="flex items-center gap-2"
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                  t.done ? "bg-primary text-primary-foreground" : "border border-muted-foreground/25"
                }`}
              >
                {t.done && <CheckCircle2 className="h-3 w-3" />}
              </div>
              <span className={`text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {t.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SpotlightProps {
  eyebrow: string;
  title: string;
  description: string;
  reversed?: boolean;
  children: React.ReactNode;
}

/** A single feature spotlight with text + product mockup in alternating layout. */
function FeatureSpotlight({ eyebrow, title, description, reversed, children }: SpotlightProps) {
  return (
    <div className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-16 ${reversed ? "lg:flex-row-reverse" : ""}`}>
      <ScrollReveal direction={reversed ? "right" : "left"} className="flex-1 space-y-4">
        <span className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h3>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </ScrollReveal>
      <ScrollReveal direction={reversed ? "left" : "right"} className="w-full flex-1">
        {children}
      </ScrollReveal>
    </div>
  );
}

/** Feature showcase with alternating text/mockup layouts — replaces the old 6-card grid. */
export function BenefitsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl space-y-24 px-4 sm:space-y-32">
        <FeatureSpotlight
          eyebrow="Stay organized"
          title="Your personalized timeline"
          description="A step-by-step relocation plan tailored to your move date. Every milestone is mapped out so you always know what's next — no guesswork, no missed deadlines."
        >
          <TimelineMockup />
        </FeatureSpotlight>

        <FeatureSpotlight
          eyebrow="Know your costs"
          title="Budget at a glance"
          description="See exactly where your money goes. From movers to deposits, get a clear cost breakdown that helps you plan smarter and avoid surprises."
          reversed
        >
          <BudgetMockup />
        </FeatureSpotlight>

        <FeatureSpotlight
          eyebrow="Track progress"
          title="Track every milestone"
          description="Watch your readiness score climb as you check off tasks. A single view of everything left to do before move day, so nothing slips through the cracks."
        >
          <ReadinessMockup />
        </FeatureSpotlight>
      </div>
    </section>
  );
}
