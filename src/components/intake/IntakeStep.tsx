"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { IntakeStep as IntakeStepType } from "@/types";

interface IntakeStepProps {
  step: IntakeStepType;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

/** Renders a single intake question with polished interactions and hover states. */
export function IntakeStepComponent({
  step,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: IntakeStepProps) {
  const stringValue = String(value ?? "");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && stringValue) {
      onNext();
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {step.question}
        </h2>
        {step.subtitle && (
          <p className="text-muted-foreground text-base sm:text-lg">
            {step.subtitle}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {step.type === "text" && (
          <Input
            type="text"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            className="h-14 rounded-xl border-2 text-lg transition-colors focus:border-primary"
            autoFocus
          />
        )}

        {step.type === "date" && (
          <Input
            type="date"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-14 rounded-xl border-2 text-lg transition-colors focus:border-primary"
            min={new Date().toISOString().split("T")[0]}
            autoFocus
          />
        )}

        {step.type === "number" && (
          <Input
            type="number"
            value={stringValue}
            onChange={(e) => onChange(parseInt(e.target.value) || 1)}
            onKeyDown={handleKeyDown}
            min={1}
            max={20}
            className="h-14 w-32 rounded-xl border-2 text-lg transition-colors focus:border-primary"
            autoFocus
          />
        )}

        {step.type === "select" && step.options && (
          <div className="grid gap-3 sm:grid-cols-2">
            {step.options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onChange(option.value);
                  setTimeout(onNext, 300);
                }}
                className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                  stringValue === option.value
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <span className="font-medium text-base">{option.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {step.encouragement && stringValue && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-primary font-medium"
          >
            {step.encouragement}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isFirst}
          className={`gap-2 ${isFirst ? "invisible" : ""}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step.type !== "select" && (
          <Button
            onClick={onNext}
            disabled={!stringValue && step.field !== "topConcern"}
            size="lg"
            className="gap-2 rounded-full px-6"
          >
            {isLast ? "Build My Plan" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
