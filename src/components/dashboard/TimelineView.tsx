"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Home,
  Briefcase,
  Truck,
  FileCheck,
  ChevronDown,
  Flame,
  Star,
} from "lucide-react";
import type { TimelineMilestone } from "@/types";

interface TimelineViewProps {
  milestones: TimelineMilestone[];
  onToggle: (id: string, isCompleted: boolean) => void;
  updatingIds: Set<string>;
  xp?: number;
  streak?: number;
}

const categoryConfig: Record<string, { icon: typeof Home; color: string; bg: string }> = {
  housing: { icon: Home, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40" },
  finance: { icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  logistics: { icon: Truck, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40" },
  admin: { icon: FileCheck, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/40" },
};

function groupByMonth(milestones: TimelineMilestone[]) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );
  const groups: { label: string; milestones: TimelineMilestone[] }[] = [];

  for (const m of sorted) {
    const d = new Date(m.targetDate);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.milestones.push(m);
    else groups.push({ label, milestones: [m] });
  }
  return groups;
}

/** Visual journey timeline with month groups, completion animations, and gamification. */
export function TimelineView({ milestones, onToggle, updatingIds, xp = 0, streak = 0 }: TimelineViewProps) {
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const completed = milestones.filter((m) => m.isCompleted).length;
  const total = milestones.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const groups = groupByMonth(milestones);

  function toggleMonth(label: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function handleToggle(id: string, complete: boolean) {
    if (complete) {
      setShowCelebration(id);
      setTimeout(() => setShowCelebration(null), 2000);
    }
    onToggle(id, complete);
  }

  return (
    <div className="space-y-6">
      {/* Hero progress section */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Your Moving Journey</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completed} of {total} milestones complete
            </p>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{streak} day streak</span>
              </div>
            )}
            {xp > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{xp} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Visual progress bar with milestone dots */}
        <div className="relative">
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: "0%" }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div
                key={mark}
                className={`h-2 w-2 rounded-full transition-colors ${
                  percentage >= mark ? "bg-primary-foreground" : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
          <span>Getting Started</span>
          <span>Planning</span>
          <span>Preparing</span>
          <span>Almost There</span>
          <span>Move Day!</span>
        </div>
      </div>

      {/* Month groups */}
      {groups.map((group) => {
        const groupCompleted = group.milestones.filter((m) => m.isCompleted).length;
        const groupTotal = group.milestones.length;
        const allDone = groupCompleted === groupTotal;
        const isExpanded = expandedMonths.has(group.label) || !allDone;

        return (
          <div key={group.label}>
            <button
              onClick={() => toggleMonth(group.label)}
              className="flex w-full items-center gap-3 mb-3 group"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                allDone
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-primary/10 text-primary"
              }`}>
                {allDone ? <CheckCircle2 className="h-4 w-4" /> : groupCompleted}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{group.label}</p>
                <p className="text-xs text-muted-foreground">
                  {allDone ? "All done!" : `${groupCompleted} of ${groupTotal} complete`}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 border-l-2 border-muted pl-6 space-y-1 overflow-hidden"
                >
                  {group.milestones.map((milestone) => {
                    const config = categoryConfig[milestone.category] ?? categoryConfig.admin;
                    const Icon = config.icon;
                    const isUpdating = updatingIds.has(milestone.id);
                    const isCelebrating = showCelebration === milestone.id;

                    return (
                      <motion.div
                        key={milestone.id}
                        layout
                        className="relative"
                      >
                        {/* Celebration burst */}
                        <AnimatePresence>
                          {isCelebrating && (
                            <motion.div
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.8 }}
                              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                            >
                              <div className="text-2xl">&#127881;</div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Connection dot on the left border */}
                        <div className="absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 border-background bg-muted" />

                        <button
                          onClick={() => handleToggle(milestone.id, !milestone.isCompleted)}
                          disabled={isUpdating}
                          className={`flex w-full items-start gap-3 rounded-xl p-4 text-left transition-all ${
                            milestone.isCompleted
                              ? "bg-muted/30 hover:bg-muted/50"
                              : "bg-card border shadow-sm hover:shadow-md hover:border-primary/20"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isUpdating ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : milestone.isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              </motion.div>
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/30" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              milestone.isCompleted ? "line-through text-muted-foreground" : ""
                            }`}>
                              {milestone.title}
                            </p>
                            {milestone.description && !milestone.isCompleted && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`flex items-center gap-1 rounded-full ${config.bg} px-2 py-0.5`}>
                                <Icon className={`h-3 w-3 ${config.color}`} />
                                <span className={`text-[10px] font-medium capitalize ${config.color}`}>
                                  {milestone.category}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(milestone.targetDate).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {!milestone.isCompleted && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              +25 XP
                            </span>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
