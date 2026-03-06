"use client";

import { useState, useEffect } from "react";
import { Lightbulb, RefreshCw, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Insight {
  title: string;
  body: string;
}

/** AI-generated personalized insights widget for the dashboard. */
export function AiInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchInsights() {
    setIsLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/ai/insights");
      const json = await response.json();
      if (json.data && json.data.length > 0) {
        setInsights(json.data);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="font-semibold text-sm">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={fetchInsights}
          aria-label="Refresh insights"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-3">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {insight.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
