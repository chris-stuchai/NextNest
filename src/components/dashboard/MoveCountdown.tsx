import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MoveCountdownProps {
  daysUntilMove: number;
  targetDate: string;
}

/** Displays the number of days remaining until the planned move date. */
export function MoveCountdown({ daysUntilMove, targetDate }: MoveCountdownProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Move Countdown
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          {daysUntilMove}
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            days
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Target: {formatDate(targetDate)}
        </p>
      </CardContent>
    </Card>
  );
}
