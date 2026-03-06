"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData } from "@/types";

/** Fetches and manages the user's relocation plan data. */
export function usePlan(planId: string | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/plan/${planId}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch {
      setError("Failed to load your plan");
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { data, isLoading, error, refetch: fetchPlan };
}
