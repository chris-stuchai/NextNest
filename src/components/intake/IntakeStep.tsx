"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

/** Renders a single intake question with appropriate input type. */
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
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {step.question}
        </h2>
        {step.subtitle && (
          <p className="text-muted-foreground">{step.subtitle}</p>
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
            className="text-lg py-6"
            autoFocus
          />
        )}

        {step.type === "date" && (
          <Input
            type="date"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-lg py-6"
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
            className="text-lg py-6 w-32"
            autoFocus
          />
        )}

        {step.type === "select" && step.options && (
          <div className="grid gap-3 sm:grid-cols-2">
            {step.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setTimeout(onNext, 300);
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 ${
                  stringValue === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {step.encouragement && stringValue && (
        <p className="text-sm text-primary font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
          {step.encouragement}
        </p>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isFirst}
          className={isFirst ? "invisible" : ""}
        >
          Back
        </Button>
        {step.type !== "select" && (
          <Button
            onClick={onNext}
            disabled={!stringValue && step.field !== "topConcern"}
            size="lg"
          >
            {isLast ? "Build My Plan" : "Continue"}
          </Button>
        )}
      </div>
    </div>
  );
}
