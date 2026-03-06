"use client";

import { motion } from "framer-motion";

interface IntakeProgressProps {
  currentStep: number;
  totalSteps: number;
}

/** Animated progress indicator with step count and smooth bar transitions. */
export function IntakeProgress({ currentStep, totalSteps }: IntakeProgressProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep + 1}{" "}
          <span className="text-muted-foreground">of {totalSteps}</span>
        </span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        />
      </div>
    </div>
  );
}
