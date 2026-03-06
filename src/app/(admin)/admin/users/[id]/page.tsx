"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { DashboardData } from "@/types";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

/** Admin detail view for a single user's profile, intake, and plan data. */
export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          fetch(`/api/admin/users/${id}`),
          fetch(`/api/admin/users/${id}/dashboard`),
        ]);

        const profileData = await profileRes.json();
        const dashboardData = await dashboardRes.json();

        if (profileData.data) setProfile(profileData.data);
        if (dashboardData.data) setDashboard(dashboardData.data);
      } catch (error) {
        console.error("User detail fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Link>

      {profile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{profile.name ?? profile.email}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {profile.email}
            </p>
            <p>
              <span className="text-muted-foreground">Joined:</span>{" "}
              {formatDate(profile.createdAt)}
            </p>
          </CardContent>
        </Card>
      )}

      {dashboard?.intake && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Intake Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">From:</span>{" "}
                {dashboard.intake.movingFrom}
              </div>
              <div>
                <span className="text-muted-foreground">To:</span>{" "}
                {dashboard.intake.movingTo}
              </div>
              <div>
                <span className="text-muted-foreground">Move Date:</span>{" "}
                {formatDate(dashboard.intake.targetMoveDate)}
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>{" "}
                <Badge variant="secondary">{dashboard.intake.moveType}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">People:</span>{" "}
                {dashboard.intake.peopleCount}
              </div>
              <div>
                <span className="text-muted-foreground">Flexibility:</span>{" "}
                {dashboard.intake.timelineFlexibility}
              </div>
              {dashboard.intake.topConcern && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Top Concern:</span>{" "}
                  {dashboard.intake.topConcern}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {dashboard?.milestones && dashboard.milestones.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Timeline</CardTitle>
            <span className="text-sm text-muted-foreground">
              {dashboard.milestones.filter((m) => m.isCompleted).length}/
              {dashboard.milestones.length} complete
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {dashboard.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={m.isCompleted ? "line-through text-muted-foreground" : ""}>
                      {m.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {m.category}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {formatDate(m.targetDate)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {dashboard?.budgetItems && dashboard.budgetItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {dashboard.budgetItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.estimatedLow)} –{" "}
                    {formatCurrency(item.estimatedHigh)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
