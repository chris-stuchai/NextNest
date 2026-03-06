"use client";

import { useEffect, useState } from "react";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { useMilestones } from "@/hooks/use-milestones";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import type { DashboardData } from "@/types";

/** Dedicated timeline page — full-width view of all milestones. */
export default function TimelinePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  useEffect(() => { fetchDashboard(); }, []);

  const { toggleMilestone, updatingIds } = useMilestones(() => fetchDashboard());

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Relocation Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Track every milestone on your journey
          </p>
        </div>
      </div>

      <TimelineView
        milestones={data.milestones}
        onToggle={toggleMilestone}
        updatingIds={updatingIds}
      />
    </motion.div>
  );
}
