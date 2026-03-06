"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  task: string;
  timeframe: string;
  priority: "high" | "medium" | "low";
  tip: string;
}

const priorityStyles = {
  high: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  medium: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20",
  low: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
};

const priorityLabels = {
  high: "High Priority",
  medium: "Medium",
  low: "Low Priority",
};

/** AI-generated personalized pre-move checklist with local toggling. */
export function AiChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateChecklist() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/checklist", { method: "POST" });
      const json = await response.json();
      if (json.data) {
        setChecklist(json.data);
        setIsGenerated(true);
        setCompleted(new Set());
      } else {
        setError(json.error ?? "Failed to generate checklist");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleItem(index: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  if (!isGenerated) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Pre-Move Checklist</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get a personalized checklist tailored to your specific move — 
          including local tips and time-sensitive tasks.
        </p>
        {error && (
          <div className="flex items-center gap-2 mb-3 text-sm text-destructive" role="alert">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
        <Button onClick={generateChecklist} disabled={isLoading} size="sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate My Checklist"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">
            AI Pre-Move Checklist
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {completed.size}/{checklist.length} done
        </span>
      </div>

      <div className="space-y-2">
        {checklist.map((item, index) => (
          <button
            key={index}
            onClick={() => toggleItem(index)}
            className={cn(
              "w-full text-left rounded-lg border-l-4 px-4 py-3 transition-all hover:shadow-sm",
              priorityStyles[item.priority],
              completed.has(index) && "opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              {completed.has(index) ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  completed.has(index) && "line-through"
                )}>
                  {item.task}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{item.timeframe}</span>
                  <span className="text-xs text-muted-foreground/60">·</span>
                  <span className="text-xs text-muted-foreground">{priorityLabels[item.priority]}</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mt-1 italic">
                  {item.tip}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={generateChecklist} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Regenerate
        </Button>
      </div>
    </div>
  );
}
