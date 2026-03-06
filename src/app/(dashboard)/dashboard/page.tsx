"use client";

import { useEffect, useState } from "react";
import { MoveCountdown } from "@/components/dashboard/MoveCountdown";
import { ReadinessScore } from "@/components/dashboard/ReadinessScore";
import { MonthlyPriorities } from "@/components/dashboard/MonthlyPriorities";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { AiInsights } from "@/components/dashboard/AiInsights";
import { AiChecklist } from "@/components/dashboard/AiChecklist";
import { NeighborhoodComparison } from "@/components/dashboard/NeighborhoodComparison";
import { MoveAdvisor } from "@/components/dashboard/MoveAdvisor";
import { useMilestones } from "@/hooks/use-milestones";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, type Variants } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { DashboardData } from "@/types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

/** Main user dashboard with staggered entrance animations. */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch {
      setError("Failed to load your dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const { toggleMilestone, updatingIds } = useMilestones(() => {
    fetchDashboard();
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-2 mb-8">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 sm:col-span-2 rounded-2xl" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-gradient-to-br from-muted/30 to-transparent p-12 text-center"
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl px-4 py-8"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your NextNest is waiting
        </h1>
        <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <p>
            {data.intake.movingFrom} &rarr; {data.intake.movingTo}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <MoveCountdown
            daysUntilMove={data.daysUntilMove}
            targetDate={data.plan.targetDate}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ReadinessScore score={data.plan.readinessScore} />
        </motion.div>
        <motion.div variants={itemVariants} className="sm:col-span-2">
          <MonthlyPriorities milestones={data.milestones} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-6">
        <AiInsights />
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <TimelineView
            milestones={data.milestones}
            onToggle={toggleMilestone}
            updatingIds={updatingIds}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <BudgetOverview items={data.budgetItems} />
        </motion.div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <AiChecklist />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NeighborhoodComparison />
        </motion.div>
      </div>

      <MoveAdvisor />
    </motion.div>
  );
}
