"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Bell, Shield, Trash2, Loader2, Save, Eye, EyeOff, AlertCircle } from "lucide-react";

/** Account settings page — notifications, password, danger zone. */
export default function SettingsPage() {
  const { data: session } = useSession();
  const [emailReminders, setEmailReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handlePasswordChange() {
    if (!newPassword || newPassword.length < 8) return;
    setSaving(true);
    setSaved(false);
    setPasswordError(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setPasswordError(data.error ?? "Failed to update password");
      }
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure? This will permanently delete your account and all associated data. This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const hasCredentials = !!session?.user?.email;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences.
        </p>

        {/* Notifications */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Email reminders</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when milestones are coming up.
                </p>
              </div>
              <Switch checked={emailReminders} onCheckedChange={setEmailReminders} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Weekly digest</p>
                <p className="text-xs text-muted-foreground">
                  Receive a weekly summary of your move progress.
                </p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Password */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Security
          </h2>
          {hasCredentials && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm">Current password</Label>
                <div className="relative max-w-sm">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm">New password</Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="max-w-sm"
                  placeholder="Min 8 characters"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <Button
                onClick={handlePasswordChange}
                disabled={saving || !newPassword || newPassword.length < 8}
                className="gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saved ? "Updated!" : "Update password"}
              </Button>
            </div>
          )}
        </section>

        <Separator className="my-8" />

        {/* Danger zone */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Danger zone
          </h2>
          <div className="mt-4 rounded-lg border border-destructive/20 p-4">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3 gap-2"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {deleting ? "Deleting..." : "Delete my account"}
            </Button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
