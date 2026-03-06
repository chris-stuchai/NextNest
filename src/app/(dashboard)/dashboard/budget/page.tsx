"use client";

import { useEffect, useState } from "react";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Save, Loader2, Wallet, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardData } from "@/types";

interface UserBudget {
  id: string;
  totalBudget: number;
  housingBudget: number | null;
  movingBudget: number | null;
  travelBudget: number | null;
  emergencyFund: number | null;
  notes: string | null;
}

/** Budget page — user's real budget + AI-estimated costs side by side. */
export default function BudgetPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [budget, setBudget] = useState<UserBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [totalBudget, setTotalBudget] = useState("");
  const [housingBudget, setHousingBudget] = useState("");
  const [movingBudget, setMovingBudget] = useState("");
  const [travelBudget, setTravelBudget] = useState("");
  const [emergencyFund, setEmergencyFund] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, budgetRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/budget"),
        ]);
        const [dashJson, budgetJson] = await Promise.all([
          dashRes.json(),
          budgetRes.json(),
        ]);
        if (dashJson.data) setData(dashJson.data);
        if (budgetJson.data) {
          const b = budgetJson.data;
          setBudget(b);
          setTotalBudget(String(b.totalBudget));
          setHousingBudget(b.housingBudget ? String(b.housingBudget) : "");
          setMovingBudget(b.movingBudget ? String(b.movingBudget) : "");
          setTravelBudget(b.travelBudget ? String(b.travelBudget) : "");
          setEmergencyFund(b.emergencyFund ? String(b.emergencyFund) : "");
        }
      } catch {
        console.error("Failed to load budget data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSave() {
    if (!totalBudget || parseInt(totalBudget) <= 0) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalBudget: parseInt(totalBudget),
          housingBudget: housingBudget ? parseInt(housingBudget) : null,
          movingBudget: movingBudget ? parseInt(movingBudget) : null,
          travelBudget: travelBudget ? parseInt(travelBudget) : null,
          emergencyFund: emergencyFund ? parseInt(emergencyFund) : null,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setBudget({
          id: budget?.id ?? "",
          totalBudget: parseInt(totalBudget),
          housingBudget: housingBudget ? parseInt(housingBudget) : null,
          movingBudget: movingBudget ? parseInt(movingBudget) : null,
          travelBudget: travelBudget ? parseInt(travelBudget) : null,
          emergencyFund: emergencyFund ? parseInt(emergencyFund) : null,
          notes: null,
        });

        // Refetch dashboard data to get the regenerated budget items
        const dashRes = await fetch("/api/dashboard");
        const dashJson = await dashRes.json();
        if (dashJson.data) setData(dashJson.data);

        setSaved(true);
        setShowForm(false);
        setTimeout(() => setSaved(false), 4000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    );
  }

  const estimatedLow = data?.budgetItems.reduce((s, i) => s + i.estimatedLow, 0) ?? 0;
  const estimatedHigh = data?.budgetItems.reduce((s, i) => s + i.estimatedHigh, 0) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Budget Overview</h1>
          <p className="text-sm text-muted-foreground">
            Your real budget vs. estimated costs
          </p>
        </div>
      </div>

      {/* Your Budget card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Your Moving Budget</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {budget ? "Edit" : "Set Budget"}
          </Button>
        </div>

        {budget && !showForm ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-transparent border p-5 text-center">
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(budget.totalBudget)}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {budget.housingBudget && (
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Housing</p>
                  <p className="text-sm font-semibold">{formatCurrency(budget.housingBudget)}</p>
                </div>
              )}
              {budget.movingBudget && (
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Moving / Logistics</p>
                  <p className="text-sm font-semibold">{formatCurrency(budget.movingBudget)}</p>
                </div>
              )}
              {budget.travelBudget && (
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Travel</p>
                  <p className="text-sm font-semibold">{formatCurrency(budget.travelBudget)}</p>
                </div>
              )}
              {budget.emergencyFund && (
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Emergency Fund</p>
                  <p className="text-sm font-semibold">{formatCurrency(budget.emergencyFund)}</p>
                </div>
              )}
            </div>

            {/* Budget vs estimates comparison */}
            {estimatedHigh > 0 && (
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your budget</span>
                  <span className="font-semibold">{formatCurrency(budget.totalBudget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">AI estimated cost</span>
                  <span className="font-semibold">
                    {formatCurrency(estimatedLow)} – {formatCurrency(estimatedHigh)}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.totalBudget >= estimatedHigh
                        ? "bg-emerald-500"
                        : budget.totalBudget >= estimatedLow
                          ? "bg-amber-500"
                          : "bg-destructive"
                    }`}
                    style={{
                      width: `${Math.min((budget.totalBudget / estimatedHigh) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {budget.totalBudget >= estimatedHigh
                    ? "AI found options that fit your budget. You're covered."
                    : budget.totalBudget >= estimatedLow
                      ? "AI optimized for your budget. Check the notes below for savings tips."
                      : "AI found the cheapest options. See notes for additional ways to save."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {(showForm || !budget) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Tell us your real moving budget and we'll build your plan around it — not the other way around.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Total moving budget *</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g. 10000"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Housing budget</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={housingBudget}
                        onChange={(e) => setHousingBudget(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Moving / logistics</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={movingBudget}
                        onChange={(e) => setMovingBudget(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Travel</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={travelBudget}
                        onChange={(e) => setTravelBudget(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Emergency fund</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={emergencyFund}
                        onChange={(e) => setEmergencyFund(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !totalBudget}
                    className="gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "AI is replanning..." : saved ? "Saved!" : "Save Budget"}
                  </Button>
                  {budget && showForm && (
                    <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* AI Estimated costs */}
      {data && <BudgetOverview items={data.budgetItems} />}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4" />
          Budget saved — costs adjusted to fit your budget
        </motion.div>
      )}
    </motion.div>
  );
}
