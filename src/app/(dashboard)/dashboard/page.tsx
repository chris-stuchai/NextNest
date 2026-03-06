"use client";

import { useEffect, useState } from "react";
import { MoveCountdown } from "@/components/dashboard/MoveCountdown";
import { ReadinessScore } from "@/components/dashboard/ReadinessScore";
import { MonthlyPriorities } from "@/components/dashboard/MonthlyPriorities";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { useMilestones } from "@/hooks/use-milestones";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types";

/** Main user dashboard — the core product experience. */
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
        <Skeleton className="h-8 w-72 mb-8" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36 sm:col-span-2" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-semibold">
            {error ?? "No plan found"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {error
              ? "Please try refreshing the page."
              : "Complete the intake to generate your personalized relocation plan."}
          </p>
          {!error && (
            <a
              href="/intake"
              className="mt-4 inline-block text-primary underline-offset-4 hover:underline"
            >
              Start your plan
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your NextNest is waiting
        </h1>
        <p className="mt-1 text-muted-foreground">
          {data.intake.movingFrom} &rarr; {data.intake.movingTo}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MoveCountdown
          daysUntilMove={data.daysUntilMove}
          targetDate={data.plan.targetDate}
        />
        <ReadinessScore score={data.plan.readinessScore} />
        <MonthlyPriorities milestones={data.milestones} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TimelineView
          milestones={data.milestones}
          onToggle={toggleMilestone}
          updatingIds={updatingIds}
        />
        <BudgetOverview items={data.budgetItems} />
      </div>
    </div>
  );
}
