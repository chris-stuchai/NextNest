"use client";

import { MovingQuotes } from "@/components/dashboard/MovingQuotes";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";

/** Dedicated quotes page — AI-powered moving company quote calls. */
export default function QuotesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Phone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Moving Quotes</h1>
          <p className="text-sm text-muted-foreground">
            Let AI call moving companies and get quotes for you
          </p>
        </div>
      </div>

      <MovingQuotes />
    </motion.div>
  );
}
