"use client";

import { useState } from "react";

/** Handles milestone completion toggling with XP rewards. */
export function useMilestones(onUpdate?: () => void) {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  async function toggleMilestone(id: string, isCompleted: boolean) {
    setUpdatingIds((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/milestones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update milestone");
      }

      if (isCompleted) {
        await fetch("/api/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "milestone_complete" }),
        });
      }

      onUpdate?.();
    } catch (error) {
      console.error("Milestone toggle error:", error);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return { toggleMilestone, updatingIds };
}
