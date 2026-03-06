"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to plan your move with confidence.",
    cta: "Get Started",
    href: "/intake",
    highlight: false,
    features: [
      "Personalized relocation timeline",
      "Budget breakdown & estimates",
      "Readiness score tracking",
      "50+ milestone checklist",
      "AI-generated move plan",
      "Email reminders",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Advanced tools for complex moves and busy families.",
    cta: "Coming Soon",
    href: "#",
    highlight: true,
    badge: "Coming Soon",
    features: [
      "Everything in Free",
      "Neighborhood comparison reports",
      "School & commute analysis",
      "Shared family dashboard",
      "Priority support",
      "Custom task creation",
      "Document storage & checklists",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For relocation companies and corporate move programs.",
    cta: "Contact Us",
    href: "mailto:hello@nextnest.app",
    highlight: false,
    features: [
      "Everything in Pro",
      "White-label dashboard",
      "Bulk employee onboarding",
      "Admin analytics & reporting",
      "API access",
      "Dedicated account manager",
    ],
  },
];

/** Pricing page with three tiers — Free, Pro, and Enterprise. */
export default function PricingPage() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Start for free. Upgrade when you need more. No hidden fees, no surprises — just like your move plan.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-primary bg-primary/[0.02] shadow-lg shadow-primary/10 ring-1 ring-primary"
                  : "bg-card"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild={plan.href !== "#"}
                variant={plan.highlight ? "default" : "outline"}
                className="w-full gap-2 rounded-full"
                disabled={plan.href === "#"}
              >
                {plan.href !== "#" ? (
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span>{plan.cta}</span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Have questions?{" "}
            <a href="mailto:hello@nextnest.app" className="font-medium text-primary hover:underline">
              Reach out to us
            </a>{" "}
            — we&apos;re happy to help.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
