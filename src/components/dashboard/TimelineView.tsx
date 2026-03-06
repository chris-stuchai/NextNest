"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { TimelineMilestone } from "@/types";
import { formatDate } from "@/lib/utils";

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  onToggle: (id: string, isCompleted: boolean) => void;
  updatingIds: Set<string>;
}

/** Full timeline listing all milestones with completion toggles. */
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relocation Timeline</CardTitle>
        <span className="text-sm text-muted-foreground">
          {completed} of {milestones.length} complete
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sorted.map((milestone) => {
            const isUpdating = updatingIds.has(milestone.id);

            return (
              <button
                key={milestone.id}
                type="button"
                onClick={() =>
                  onToggle(milestone.id, !milestone.isCompleted)
                }
                disabled={isUpdating}
                className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="mt-0.5 shrink-0">
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : milestone.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p
                    className={`font-medium ${
                      milestone.isCompleted
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {milestone.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(milestone.targetDate)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
