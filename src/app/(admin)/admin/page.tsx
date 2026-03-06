"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/admin/StatsCards";
import { UserTable } from "@/components/admin/UserTable";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  totalUsers: number;
  completedIntakes: number;
  activePlans: number;
  milestoneCompletionRate: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  hasIntake: boolean;
  hasPlan: boolean;
  milestonesCompleted: number;
  milestonesTotal: number;
}

/** Admin dashboard — overview of platform engagement and user activity. */
export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();

        if (statsData.error || usersData.error) {
          setError(statsData.error ?? usersData.error);
        }
        if (statsData.data) setStats(statsData.data);
        if (usersData.data) setAdminUsers(usersData.data);
      } catch {
        setError("Failed to load admin data. Please try refreshing.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">
        Admin Dashboard
      </h1>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3" role="alert">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {stats && <StatsCards stats={stats} />}

      <div className="mt-8">
        <UserTable users={adminUsers} />
      </div>
    </div>
  );
}
