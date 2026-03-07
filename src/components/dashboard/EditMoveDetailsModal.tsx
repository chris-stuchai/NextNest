"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlacesAutocomplete } from "@/components/intake/PlacesAutocomplete";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface EditMoveDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingFrom: string;
  movingTo: string;
  targetMoveDate: string;
  planId: string;
  onSuccess: () => void;
}

/**
 * Modal for editing move locations and timeline. On save, patches intake,
 * regenerates plan, and refreshes the dashboard.
 */
export function EditMoveDetailsModal({
  open,
  onOpenChange,
  movingFrom,
  movingTo,
  targetMoveDate,
  planId,
  onSuccess,
}: EditMoveDetailsModalProps) {
  const [from, setFrom] = useState(movingFrom);
  const [to, setTo] = useState(movingTo);
  const [date, setDate] = useState(targetMoveDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFrom(movingFrom);
      setTo(movingTo);
      setDate(targetMoveDate);
      setError(null);
    }
  }, [open, movingFrom, movingTo, targetMoveDate]);

  async function handleSave() {
    if (!from.trim() || !to.trim() || !date) {
      setError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const patchRes = await fetch("/api/intake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movingFrom: from.trim(),
          movingTo: to.trim(),
          targetMoveDate: date,
        }),
      });

      const patchData = await patchRes.json();

      if (!patchRes.ok) {
        throw new Error(patchData.error ?? "Failed to update move details");
      }

      const regenRes = await fetch("/api/plan/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const regenData = await regenRes.json();

      if (!regenRes.ok) {
        throw new Error(regenData.error ?? "Failed to regenerate timeline");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    from.trim() !== movingFrom || to.trim() !== movingTo || date !== targetMoveDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit move details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="moving-from">Moving from</Label>
            <PlacesAutocomplete
              value={from}
              onChange={setFrom}
              placeholder="e.g. San Francisco, CA"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moving-to">Moving to</Label>
            <PlacesAutocomplete
              value={to}
              onChange={setTo}
              placeholder="e.g. Austin, TX"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-date">Target move date</Label>
            <Input
              id="target-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="h-12 rounded-xl"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
