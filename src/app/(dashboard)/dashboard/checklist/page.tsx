"use client";

import { AiChecklist } from "@/components/dashboard/AiChecklist";
import { NeighborhoodComparison } from "@/components/dashboard/NeighborhoodComparison";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

/** Dedicated checklist page — AI checklist + neighborhood comparison. */
export default function ChecklistPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pre-Move Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Personalized tasks and local tips for your move
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <AiChecklist />
        <NeighborhoodComparison />
      </div>
    </motion.div>
  );
}
