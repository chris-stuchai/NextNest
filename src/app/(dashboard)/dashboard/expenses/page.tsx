"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Loader2,
  Trash2,
  Building2,
  Tag,
  ArrowRight,
  X,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PlaidTransaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  institution: string | null;
}

interface MoveExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  plaidTransactionId: string | null;
  notes: string | null;
}

const expenseCategories = [
  "Moving Company",
  "Truck Rental",
  "Packing Supplies",
  "Storage",
  "Travel",
  "Deposit / Fees",
  "Utilities",
  "Cleaning",
  "Furniture",
  "Other",
];

/** Expense tracking page with Plaid integration and manual entry. */
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<MoveExpense[]>([]);
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [linking, setLinking] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualCategory, setManualCategory] = useState("Moving Company");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    try {
      const [expenseRes, txRes] = await Promise.all([
        fetch("/api/expenses").then((r) => r.json()),
        fetch("/api/plaid/transactions").then((r) => r.json()),
      ]);
      if (expenseRes.data) setExpenses(expenseRes.data);
      if (txRes.data) setTransactions(txRes.data);
      setIsConnected(txRes.connected ?? false);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function connectBank() {
    setLinking(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
      const data = await res.json();

      if (!data.linkToken) {
        setLinking(false);
        return;
      }

      // Plaid Link is loaded via CDN script — initialize it here
      const PlaidLink = (window as unknown as Record<string, unknown>).Plaid as { create?: (config: Record<string, unknown>) => { open: () => void } } | undefined;
      if (!PlaidLink?.create) {
        alert("Plaid Link is loading. Please try again in a moment.");
        setLinking(false);
        return;
      }

      const handler = PlaidLink.create({
        token: data.linkToken,
        onSuccess: async (publicToken: string, metadata: Record<string, unknown>) => {
          await fetch("/api/plaid/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              publicToken,
              institutionName: (metadata?.institution as Record<string, string>)?.name,
            }),
          });
          fetchData();
          setLinking(false);
        },
        onExit: () => setLinking(false),
      });
      handler.open();
    } catch {
      setLinking(false);
    }
  }

  async function tagTransaction(tx: PlaidTransaction) {
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tx.name,
        amount: tx.amount,
        category: tx.category,
        date: tx.date,
        plaidTransactionId: tx.id,
      }),
    });
    fetchData();
  }

  async function addManualExpense() {
    if (!manualName || !manualAmount) return;
    const parsed = parseFloat(manualAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualName,
          amount: Math.round(parsed * 100),
          category: manualCategory,
          date: manualDate,
        }),
      });
      if (!res.ok) return;
    } catch {
      return;
    }

    setManualName("");
    setManualAmount("");
    setShowManual(false);
    fetchData();
  }

  async function removeExpense(id: string) {
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const taggedIds = new Set(expenses.filter((e) => e.plaidTransactionId).map((e) => e.plaidTransactionId));

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Move Expenses</h1>
            <p className="text-sm text-muted-foreground">
              Track every dollar spent on your move
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowManual(!showManual)}
          >
            <Plus className="h-3.5 w-3.5" /> Manual
          </Button>
          {!isConnected && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={connectBank}
              disabled={linking}
            >
              {linking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
              Connect Bank
            </Button>
          )}
        </div>
      </div>

      {/* Total spent card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border p-6 mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Total Move Spending
        </p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(totalSpent / 100)}</p>
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([cat, total]) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                >
                  <Tag className="h-3 w-3" />
                  {cat}: {formatCurrency(total / 100)}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Manual entry form */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Add Expense</h2>
                <button onClick={() => setShowManual(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="What did you spend on?"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="pl-9"
                    step="0.01"
                  />
                </div>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="h-9 rounded-md border bg-transparent px-3 text-sm"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                />
              </div>
              <Button
                onClick={addManualExpense}
                disabled={!manualName || !manualAmount}
                className="mt-3 gap-2"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank transactions to tag */}
      {isConnected && transactions.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex w-full items-center justify-between rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Bank Transactions</p>
                <p className="text-xs text-muted-foreground">
                  {transactions.length} recent transactions — tap to tag as move expenses
                </p>
              </div>
            </div>
            <ArrowRight className={`h-4 w-4 text-muted-foreground transition-transform ${showTransactions ? "rotate-90" : ""}`} />
          </button>

          <AnimatePresence>
            {showTransactions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {transactions
                  .filter((t) => !taggedIds.has(t.id))
                  .slice(0, 20)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date} · {tx.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(tx.amount / 100)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => tagTransaction(tx)}
                          className="gap-1 text-xs"
                        >
                          <Tag className="h-3 w-3" /> Tag
                        </Button>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tagged expenses list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-sm">No expenses tracked yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Connect your bank to automatically pull transactions, or add expenses manually.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Tagged Expenses ({expenses.length})
          </h2>
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.date} · {expense.category}
                    {expense.plaidTransactionId && " · via bank"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(expense.amount / 100)}
                </span>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
