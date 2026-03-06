"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { BudgetItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BudgetOverviewProps {
  items: BudgetItem[];
}

/** Animated budget breakdown with progress bars and staggered reveal. */
export function BudgetOverview({ items }: BudgetOverviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const totalLow = items.reduce((sum, item) => sum + item.estimatedLow, 0);
  const totalHigh = items.reduce((sum, item) => sum + item.estimatedHigh, 0);

  const grouped = items.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryEntries = Object.entries(grouped);

  return (
    <Card ref={ref} className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Budget Overview</CardTitle>
        <div className="rounded-xl bg-emerald-500/10 p-2">
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total summary */}
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border p-5 text-center">
          <p className="text-sm text-muted-foreground">Estimated Total</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalLow)} – {formatCurrency(totalHigh)}
          </p>
        </div>

        {/* Category breakdown */}
        {categoryEntries.map(([category, categoryItems], catIndex) => {
          const catLow = categoryItems.reduce((s, i) => s + i.estimatedLow, 0);
          const catHigh = categoryItems.reduce((s, i) => s + i.estimatedHigh, 0);
          const barWidth = totalHigh > 0 ? (catHigh / totalHigh) * 100 : 0;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: catIndex * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">{category}</h4>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatCurrency(catLow)} – {formatCurrency(catHigh)}
                </span>
              </div>

              {/* Category proportion bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-muted mb-3">
                <motion.div
                  className="h-full rounded-full bg-primary/50"
                  initial={{ width: "0%" }}
                  animate={isInView ? { width: `${barWidth}%` } : undefined}
                  transition={{ duration: 0.8, delay: catIndex * 0.1, ease: "easeOut" }}
                />
              </div>

              <div className="space-y-1.5">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm bg-muted/30 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <span>{item.label}</span>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 ml-4 text-muted-foreground tabular-nums">
                      {formatCurrency(item.estimatedLow)} –{" "}
                      {formatCurrency(item.estimatedHigh)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        <p className="text-xs text-muted-foreground text-center pt-2">
          These are informational estimates, not financial projections.
        </p>
      </CardContent>
    </Card>
  );
}
