import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import type { TimelineMilestone } from "@/types";
import { formatDate } from "@/lib/utils";

interface MonthlyPrioritiesProps {
  milestones: TimelineMilestone[];
}

/** Shows the next 3 upcoming incomplete milestones as monthly priorities. */
export function MonthlyPriorities({ milestones }: MonthlyPrioritiesProps) {
  const upcoming = milestones
    .filter((m) => !m.isCompleted)
    .sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    )
    .slice(0, 3);

  return (
    <Card className="sm:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Your Next Priorities
        </CardTitle>
        <ListChecks className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            All caught up! You&apos;ve completed all your milestones.
          </p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{milestone.title}</p>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {milestone.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(milestone.targetDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
