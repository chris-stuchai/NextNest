"use client";

import { useEffect, useState, useCallback } from "react";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { useMilestones } from "@/hooks/use-milestones";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Users,
  Plus,
  X,
  Mail,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  Share2,
} from "lucide-react";
import type { DashboardData } from "@/types";

interface Partner {
  id: string;
  email: string;
  status: string;
  partnerName: string | null;
}

interface XpData {
  totalXp: number;
  level: number;
  currentStreak: number;
}

/** Timeline page with visual journey, partner invites, and gamification. */
export default function TimelinePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [xpData, setXpData] = useState<XpData | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, xpRes, partnerRes] = await Promise.all([
        fetch("/api/dashboard").then((r) => r.json()),
        fetch("/api/xp").then((r) => r.json()),
        fetch("/api/partners").then((r) => r.json()),
      ]);
      if (dashRes.data) setData(dashRes.data);
      else setError(dashRes.error ?? "Failed to load timeline");
      if (xpRes.data) setXpData(xpRes.data);
      if (partnerRes.data) setPartners(partnerRes.data);
    } catch {
      setError("Failed to load timeline. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const { toggleMilestone, updatingIds } = useMilestones(() => fetchAll());

  async function handleInvite() {
    if (!inviteEmail.includes("@")) return;
    setInviting(true);
    try {
      await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteEmail("");
      setShowInvite(false);
      const res = await fetch("/api/partners").then((r) => r.json());
      if (res.data) setPartners(res.data);
    } finally {
      setInviting(false);
    }
  }

  async function removePartner(id: string) {
    await fetch(`/api/partners?id=${id}`, { method: "DELETE" });
    setPartners((prev) => prev.filter((p) => p.id !== id));
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 rounded-2xl mb-4" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-sm">{error ?? "No timeline data found"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete the intake to generate your relocation timeline.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setIsLoading(true); setError(null); fetchAll(); }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Your Journey</h1>
            <p className="text-sm text-muted-foreground">
              {data.intake.movingFrom} → {data.intake.movingTo}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowInvite(!showInvite)}
        >
          <Users className="h-3.5 w-3.5" />
          {partners.length > 0 ? `${partners.length + 1} movers` : "Invite Partner"}
        </Button>
      </div>

      {/* Partner invite section */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Moving Together</h2>
                </div>
                <button onClick={() => setShowInvite(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Invite your partner, roommate, or family member to collaborate on the move.
                They'll see the same timeline and can check off tasks too.
              </p>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Partner's email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  className="flex-1"
                />
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.includes("@")}
                  size="sm"
                  className="gap-1.5"
                >
                  {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Invite
                </Button>
              </div>

              {/* Existing partners */}
              {partners.length > 0 && (
                <div className="mt-4 space-y-2">
                  {partners.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {(p.partnerName?.[0] ?? p.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.partnerName ?? p.email}</p>
                          <div className="flex items-center gap-1">
                            {p.status === "active" ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-500" />
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {p.status === "active" ? "Active" : "Invited"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removePartner(p.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <TimelineView
        milestones={data.milestones}
        onToggle={toggleMilestone}
        updatingIds={updatingIds}
        xp={xpData?.totalXp}
        streak={xpData?.currentStreak}
      />
    </motion.div>
  );
}
