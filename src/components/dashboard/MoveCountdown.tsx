"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";

interface MoveCountdownProps {
  daysUntilMove: number;
  targetDate: string;
}

/** Animated countdown card with large number and gradient accent. */
export function MoveCountdown({ daysUntilMove, targetDate }: MoveCountdownProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Move Countdown
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-1.5">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          <AnimatedCounter target={daysUntilMove} duration={1.2} />
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            days
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Target: {formatDate(targetDate)}
        </p>
      </CardContent>
    </Card>
  );
}
