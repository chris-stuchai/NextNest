"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Loader2,
  Plus,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MovingQuote {
  id: string;
  companyName: string;
  phoneNumber: string;
  callId: string | null;
  status: "pending" | "calling" | "connected" | "completed" | "failed";
  transcript: string | null;
  quoteLow: number | null;
  quoteHigh: number | null;
  notes: string | null;
  createdAt: string;
}

const statusConfig = {
  pending: { icon: Phone, label: "Ready to call", color: "text-muted-foreground" },
  calling: { icon: PhoneCall, label: "Calling...", color: "text-amber-500" },
  connected: { icon: PhoneCall, label: "Connected", color: "text-blue-500" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-emerald-500" },
  failed: { icon: PhoneOff, label: "Failed", color: "text-destructive" },
};

/** Dashboard card for managing AI-powered moving company quote calls. */
export function MovingQuotes() {
  const [quotes, setQuotes] = useState<MovingQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchQuotes() {
    try {
      const res = await fetch("/api/quotes");
      const data = await res.json();
      if (data.data) setQuotes(data.data);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Poll active calls every 5 seconds
  useEffect(() => {
    const hasActiveCalls = quotes.some(
      (q) => q.status === "calling" || q.status === "connected"
    );
    if (!hasActiveCalls) return;

    const interval = setInterval(fetchQuotes, 5000);
    return () => clearInterval(interval);
  }, [quotes]);

  async function initiateCall() {
    if (!companyName.trim() || !phoneNumber.trim()) return;
    setIsCalling(true);
    setError(null);

    try {
      const res = await fetch("/api/retell/outbound-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, phoneNumber }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to initiate call");
        return;
      }

      setCompanyName("");
      setPhoneNumber("");
      setShowForm(false);
      fetchQuotes();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCalling(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Moving Quotes</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "Add Company"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Let our AI call moving companies on your behalf to get quotes.
      </p>

      {/* Add company form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4 space-y-3 rounded-xl border bg-muted/20 p-4">
              <Input
                placeholder="Company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-10"
              />
              <Input
                placeholder="Phone number (e.g. +14155551234)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-10"
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {error}
                </div>
              )}
              <Button
                onClick={initiateCall}
                disabled={isCalling || !companyName.trim() || !phoneNumber.trim()}
                size="sm"
                className="gap-2"
              >
                {isCalling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PhoneCall className="h-3.5 w-3.5" />
                )}
                Call for Quote
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quotes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-6 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            No quotes yet. Add a moving company to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote) => {
            const config = statusConfig[quote.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted",
                    quote.status === "calling" || quote.status === "connected"
                      ? "animate-pulse"
                      : ""
                  )}
                >
                  <StatusIcon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{quote.companyName}</p>
                  <p className={cn("text-xs", config.color)}>{config.label}</p>
                </div>
                {quote.quoteLow != null && quote.quoteHigh != null && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatCurrency(quote.quoteLow)} – {formatCurrency(quote.quoteHigh)}
                    </p>
                    <p className="text-xs text-muted-foreground">Estimated</p>
                  </div>
                )}
                {quote.status === "completed" && quote.quoteLow == null && (
                  <span className="text-xs text-muted-foreground">No quote extracted</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
