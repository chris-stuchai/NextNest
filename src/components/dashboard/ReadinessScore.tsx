"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface ReadinessScoreProps {
  score: number;
}

/** Animated circular progress with counting score and color transitions. */
export function ReadinessScore({ score }: ReadinessScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    let frameId: number;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, score]);

  function getScoreColor(s: number): string {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-primary";
    if (s >= 40) return "text-amber-500";
    return "text-muted-foreground";
  }

  function getScoreLabel(s: number): string {
    if (s >= 80) return "Almost ready!";
    if (s >= 60) return "Making great progress";
    if (s >= 40) return "On your way";
    if (s >= 20) return "Getting started";
    return "Just beginning";
  }

  return (
    <Card ref={ref}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Move Readiness
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-1.5">
          <Target className="h-4 w-4 text-primary" />
        </div>
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
              strokeWidth="5"
              className="text-muted/30"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={isInView ? { strokeDashoffset: offset } : undefined}
              transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
              strokeLinecap="round"
              className={getScoreColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">{animatedScore}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {getScoreLabel(score)}
        </p>
      </CardContent>
    </Card>
  );
}
