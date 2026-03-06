"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Loader2,
  Star,
  ExternalLink,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Zap,
  RefreshCw,
} from "lucide-react";

interface MoverRecommendation {
  name: string;
  type: string;
  priceRange: string;
  bestFor: string;
  website?: string;
  phone?: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
}

const typeLabels: Record<string, string> = {
  "full-service": "Full Service",
  "labor-only": "Labor Only",
  "truck-rental": "Truck Rental",
  "pod-storage": "Pod / Storage",
  specialty: "Specialty",
};

/** AI-powered mover finder page. */
export default function MoversPage() {
  const [movers, setMovers] = useState<MoverRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function findMovers() {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch("/api/movers", { method: "POST" });
      const json = await res.json();
      if (json.data) setMovers(json.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Find Movers</h1>
            <p className="text-sm text-muted-foreground">
              AI-matched moving companies based on your details
            </p>
          </div>
        </div>
        {hasSearched && (
          <Button variant="outline" size="sm" onClick={findMovers} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        )}
      </div>

      {!hasSearched && (
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Let AI find your perfect movers</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            We'll analyze your move details — origin, destination, budget, household size,
            and timeline — to recommend the best moving companies for your situation.
          </p>
          <Button
            onClick={findMovers}
            disabled={isLoading}
            className="mt-6 gap-2 rounded-full px-8"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Find My Movers
          </Button>
        </div>
      )}

      {isLoading && hasSearched && (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium">Searching for the best movers...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Analyzing your route, budget, and household needs
          </p>
        </div>
      )}

      <AnimatePresence>
        {!isLoading && movers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {movers.map((mover, index) => (
              <motion.div
                key={mover.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{mover.name}</h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {typeLabels[mover.type] ?? mover.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{mover.bestFor}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{mover.priceRange}</p>
                    {mover.rating && (
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{mover.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {mover.pros && mover.pros.length > 0 && (
                    <div className="space-y-1.5">
                      {mover.pros.map((pro, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <ThumbsUp className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {mover.cons && mover.cons.length > 0 && (
                    <div className="space-y-1.5">
                      {mover.cons.map((con, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <ThumbsDown className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {mover.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      asChild
                    >
                      <a href={mover.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" /> Website
                      </a>
                    </Button>
                  )}
                  {mover.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      asChild
                    >
                      <a href={`tel:${mover.phone}`}>
                        <Phone className="h-3 w-3" /> Call
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
