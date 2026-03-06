"use client";

import { useEffect, useState } from "react";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import type { DashboardData } from "@/types";

/** Dedicated budget page — full-width budget breakdown. */
export default function BudgetPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    }
    load();
  }, []);

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
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Budget Overview</h1>
          <p className="text-sm text-muted-foreground">
            Your estimated moving costs at a glance
          </p>
        </div>
      </div>

      <BudgetOverview items={data.budgetItems} />
    </motion.div>
  );
}
