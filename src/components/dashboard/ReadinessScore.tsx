import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface ReadinessScoreProps {
  score: number;
}

/** Circular progress display of the user's move readiness score. */
export function ReadinessScore({ score }: ReadinessScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  function getScoreLabel(s: number): string {
    if (s >= 80) return "Almost ready!";
    if (s >= 60) return "Making great progress";
    if (s >= 40) return "On your way";
    if (s >= 20) return "Getting started";
    return "Just beginning";
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Move Readiness
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/40"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-primary transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {getScoreLabel(score)}
        </p>
      </CardContent>
    </Card>
  );
}
