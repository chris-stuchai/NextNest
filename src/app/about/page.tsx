"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    title: "Move-day empathy",
    description:
      "We've been through stressful moves ourselves. That frustration is exactly why NextNest exists — to make it better for everyone.",
  },
  {
    title: "Radical simplicity",
    description:
      "Moving is complicated enough. Our product strips away the noise and gives you one clear plan to follow, step by step.",
  },
  {
    title: "AI with purpose",
    description:
      "We use AI not as a gimmick but as a tool to understand your unique situation and generate a plan that actually fits your life.",
  },
  {
    title: "Transparency first",
    description:
      "No hidden costs, no paywalls on essentials. Your core relocation plan is free — because stress shouldn't come with a price tag.",
  },
];

const stats = [
  { value: "3 min", label: "to generate a plan" },
  { value: "50+", label: "milestones tracked" },
  { value: "0", label: "hidden fees" },
];

/** About page — company mission, values, and story. */
export default function AboutPage() {
  return (
    <div className="py-24 sm:py-32">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Moving should feel like progress, not panic.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            NextNest was born from a simple frustration: every time we moved, we ended
            up buried in spreadsheets, forgotten tasks, and last-minute surprises.
            There had to be a better way. So we built one.
          </p>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="mt-20 border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x px-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="py-10 text-center"
            >
              <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our mission
          </h2>
          <p className="mt-4 max-w-3xl text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl">
            To turn the chaos of relocation into a calm, organized journey — so
            every family, couple, and individual can focus on the excitement of
            what&apos;s next instead of the stress of getting there.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm font-semibold uppercase tracking-widest text-primary"
        >
          What we believe
        </motion.h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              className="space-y-2"
            >
              <h3 className="text-lg font-semibold">{value.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How AI works */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border bg-card p-8 sm:p-12"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Powered by AI
          </h2>
          <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Intelligence behind every plan
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            When you answer our intake questions, our AI engine analyzes your move
            date, location, household size, and priorities to generate a fully
            personalized relocation plan. It creates your timeline, estimates your
            budget, and prioritizes tasks based on what matters most to you — all in
            under 3 minutes.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            This isn&apos;t a one-size-fits-all checklist. It&apos;s a plan built
            specifically for your situation, adapting to whether you&apos;re moving
            across town or across the country, renting or buying, moving alone or
            with a family.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to plan your move?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            It takes 3 minutes. It&apos;s free. And it might be the best decision
            you make before move day.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2 rounded-full px-8">
            <Link href="/intake">
              Build My Move Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
