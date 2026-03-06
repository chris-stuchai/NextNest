"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useMilestones } from "@/hooks/use-milestones";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import {
  ArrowRight,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Circle,
  MapPin,
  TrendingUp,
  Clock,
  FileText,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { DashboardData } from "@/types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

/** Clean, guided dashboard — shows the user what matters most. */
export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      if (result.error) setError(result.error);
      else setData(result.data);
    } catch {
      setError("Failed to load your dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchDashboard(); }, []);

  const { toggleMilestone, updatingIds } = useMilestones(() => fetchDashboard());

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border p-12 text-center"
        >
          <h2 className="text-xl font-semibold">
            {error ?? "No plan found"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {error
              ? "Please try refreshing the page."
              : "Complete the intake to generate your personalized relocation plan."}
          </p>
          {!error && (
            <Button asChild className="mt-6 gap-2 rounded-full px-6">
              <Link href="/intake">
                Start your plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  const completedCount = data.milestones.filter((m) => m.isCompleted).length;
  const totalCount = data.milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalBudgetLow = data.budgetItems.reduce((s, i) => s + i.estimatedLow, 0);
  const totalBudgetHigh = data.budgetItems.reduce((s, i) => s + i.estimatedHigh, 0);

  const nextMilestone = data.milestones
    .filter((m) => !m.isCompleted)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero welcome */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border p-8 sm:p-10"
      >
        <div className="relative z-10">
          <p className="text-sm font-medium text-primary">Welcome back, {firstName}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Your NextNest is waiting
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{data.intake.movingFrom} → {data.intake.movingTo}</span>
          </div>
        </div>

        {/* Large countdown */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:block">
          <div className="text-right">
            <div className="text-5xl font-bold tracking-tight text-primary/80">
              <AnimatedCounter target={data.daysUntilMove} duration={1.2} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">days until move day</p>
          </div>
        </div>

        {/* Mobile countdown */}
        <div className="mt-4 flex items-center gap-2 sm:hidden">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold">{data.daysUntilMove} days</span>
          <span className="text-sm text-muted-foreground">until move day</span>
        </div>
      </motion.div>

      {/* Three stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/dashboard/timeline" className="block">
            <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tabular-nums">{progressPercent}%</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {completedCount} of {totalCount} milestones
                </p>
              </div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/dashboard/budget" className="block">
            <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(totalBudgetLow)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  to {formatCurrency(totalBudgetHigh)} estimated
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/dashboard/checklist" className="block">
            <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                  <CalendarDays className="h-4 w-4 text-amber-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tabular-nums">
                  {formatDate(data.plan.targetDate)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">Move date</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* What's next — single focused card */}
      {nextMilestone && (
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xs font-bold">1</span>
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your next step
              </h2>
            </div>

            <button
              onClick={() => toggleMilestone(nextMilestone.id, true)}
              disabled={updatingIds.has(nextMilestone.id)}
              className="flex w-full items-start gap-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent p-5 text-left transition-colors hover:from-primary/10"
            >
              <Circle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{nextMilestone.title}</p>
                {nextMilestone.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {nextMilestone.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Due {formatDate(nextMilestone.targetDate)}
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {nextMilestone.category}
              </div>
            </button>

            {/* Preview of next 2 milestones */}
            {data.milestones
              .filter((m) => !m.isCompleted && m.id !== nextMilestone.id)
              .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
              .slice(0, 2)
              .map((m) => (
                <div key={m.id} className="mt-2 flex items-center gap-4 rounded-xl px-5 py-3 text-sm text-muted-foreground">
                  <Circle className="h-4 w-4 shrink-0" />
                  <span className="truncate">{m.title}</span>
                  <span className="ml-auto shrink-0 text-xs">{formatDate(m.targetDate)}</span>
                </div>
              ))}

            <Link
              href="/dashboard/timeline"
              className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View full timeline
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recently completed */}
      {completedCount > 0 && (
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Recently completed
            </h2>
            <div className="space-y-2">
              {data.milestones
                .filter((m) => m.isCompleted)
                .slice(0, 3)
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-muted-foreground line-through truncate">{m.title}</span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick links */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/checklist"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Pre-Move Checklist</p>
              <p className="text-xs text-muted-foreground">AI-generated tasks for your move</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/dashboard/quotes"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Get Moving Quotes</p>
              <p className="text-xs text-muted-foreground">AI calls companies for you</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/dashboard/lease"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Upload Your Lease</p>
              <p className="text-xs text-muted-foreground">AI extracts dates, deposits & move-out tasks</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/dashboard/photos"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
              <Camera className="h-5 w-5 text-sky-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Document Move-Out</p>
              <p className="text-xs text-muted-foreground">Photos & video to protect your deposit</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
