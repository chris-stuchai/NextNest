"use client";

import {
  Calendar,
  Target,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

const benefits = [
  {
    icon: Calendar,
    title: "Personalized Timeline",
    description:
      "A step-by-step relocation plan tailored to your move date, housing type, and unique circumstances.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Target,
    title: "Readiness Score",
    description:
      "Track how prepared you are with a real-time score that updates as you complete milestones.",
    gradient: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    icon: DollarSign,
    title: "Budget Guidance",
    description:
      "Estimated cost breakdowns for every category — from moving companies to utility setup.",
    gradient: "from-amber-500/10 to-yellow-500/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: CheckCircle2,
    title: "Milestone Tracking",
    description:
      "Check off tasks as you go. Never miss a critical deadline like utility transfers or address changes.",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    icon: Clock,
    title: "Smart Reminders",
    description:
      "Automated nudges that get more frequent as your move date approaches, keeping you on track.",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
  },
  {
    icon: TrendingUp,
    title: "Monthly Priorities",
    description:
      "Know exactly what to focus on each month so nothing falls through the cracks.",
    gradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
];

/** Grid of product benefits with scroll-triggered staggered reveal and hover effects. */
export function BenefitsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal>
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Why NextNest
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                move stress-free
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              NextNest transforms the chaos of relocation into a calm, organized
              journey you actually feel good about.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.08}
        >
          {benefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <div
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${benefit.gradient} p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${benefit.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <benefit.icon className={`h-5 w-5 ${benefit.iconColor}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
