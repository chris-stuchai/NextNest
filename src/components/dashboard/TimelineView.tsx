"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TimelineMilestone } from "@/types";
import { formatDate } from "@/lib/utils";

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  onToggle: (id: string, isCompleted: boolean) => void;
  updatingIds: Set<string>;
}

const categoryColors: Record<string, string> = {
  housing: "bg-blue-100 text-blue-700 border-blue-200",
  finance: "bg-emerald-100 text-emerald-700 border-emerald-200",
  logistics: "bg-amber-100 text-amber-700 border-amber-200",
  admin: "bg-violet-100 text-violet-700 border-violet-200",
};

/** Polished timeline with animated completion toggles and visual hierarchy. */
export function TimelineView({
  milestones,
  onToggle,
  updatingIds,
}: TimelineViewProps) {
  const sorted = [...milestones].sort(
    (a, b) =>
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  const completed = milestones.filter((m) => m.isCompleted).length;
  const percentage = milestones.length > 0
    ? Math.round((completed / milestones.length) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Relocation Timeline</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {completed} of {milestones.length} complete ({percentage}%)
          </p>
        </div>
        {/* Mini progress */}
        <div className="w-20">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sorted.map((milestone) => {
            const isUpdating = updatingIds.has(milestone.id);

            return (
              <motion.button
                key={milestone.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  onToggle(milestone.id, !milestone.isCompleted)
                }
                disabled={isUpdating}
                className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all hover:bg-muted/50"
              >
                <div className="mt-0.5 shrink-0">
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : milestone.isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 transition-colors hover:text-primary/50" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <p
                    className={`font-medium text-sm transition-all ${
                      milestone.isCompleted
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs border-0 ${categoryColors[milestone.category] ?? ""}`}
                    >
                      {milestone.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(milestone.targetDate)}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
