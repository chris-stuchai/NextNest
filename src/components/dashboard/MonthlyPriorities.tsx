"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, ArrowRight } from "lucide-react";
import type { TimelineMilestone } from "@/types";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

interface MonthlyPrioritiesProps {
  milestones: TimelineMilestone[];
}

const categoryColors: Record<string, string> = {
  housing: "bg-blue-100 text-blue-700",
  finance: "bg-emerald-100 text-emerald-700",
  logistics: "bg-amber-100 text-amber-700",
  admin: "bg-violet-100 text-violet-700",
};

/** Animated monthly priorities showing the next 3 upcoming milestones. */
export function MonthlyPriorities({ milestones }: MonthlyPrioritiesProps) {
  const upcoming = milestones
    .filter((m) => !m.isCompleted)
    .sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    )
    .slice(0, 3);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Your Next Priorities
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-1.5">
          <ListChecks className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">
              All caught up! You&apos;ve completed all your milestones.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((milestone, i) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{milestone.title}</p>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge
                    variant="secondary"
                    className={`text-xs border-0 ${categoryColors[milestone.category] ?? ""}`}
                  >
                    {milestone.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(milestone.targetDate)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
