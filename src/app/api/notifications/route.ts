import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getResend, emailFrom } from "@/lib/resend";
import {
  users,
  relocationPlans,
  timelineMilestones,
  notificationLog,
} from "@/lib/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { reminderEmailHtml } from "@/lib/email/templates";
import type { ApiResponse } from "@/types";

/**
 * Returns the notification frequency based on months until move.
 * 6-12 months: monthly (30 days), 3-6 months: biweekly (14 days), 0-3 months: weekly (7 days)
 */
function getNotificationIntervalDays(monthsUntilMove: number): number {
  if (monthsUntilMove > 6) return 30;
  if (monthsUntilMove > 3) return 14;
  return 7;
}

/** POST /api/notifications — Sends scheduled reminder emails (called via cron). */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // SECURITY: always require a valid CRON_SECRET — reject if missing or mismatched
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const db = getDb();
    const resend = getResend();
    const now = new Date();
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

    const plansWithUsers = await db
      .select({
        planId: relocationPlans.id,
        userId: relocationPlans.userId,
        targetDate: relocationPlans.targetDate,
        userName: users.name,
        userEmail: users.email,
      })
      .from(relocationPlans)
      .innerJoin(users, eq(users.id, relocationPlans.userId))
      .where(gte(relocationPlans.targetDate, now.toISOString().split("T")[0]));

    let sentCount = 0;

    for (const plan of plansWithUsers) {
      const moveDate = new Date(plan.targetDate);
      const monthsUntilMove =
        (moveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const intervalDays = getNotificationIntervalDays(monthsUntilMove);

      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - intervalDays);

      const [recentNotification] = await db
        .select()
        .from(notificationLog)
        .where(
          and(
            eq(notificationLog.userId, plan.userId),
            eq(notificationLog.type, "reminder"),
            gte(notificationLog.sentAt, cutoffDate)
          )
        )
        .limit(1);

      if (recentNotification) continue;

      const upcomingMilestones = await db
        .select({
          title: timelineMilestones.title,
          targetDate: timelineMilestones.targetDate,
        })
        .from(timelineMilestones)
        .where(
          and(
            eq(timelineMilestones.planId, plan.planId),
            eq(timelineMilestones.isCompleted, false),
            lte(
              timelineMilestones.targetDate,
              new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            )
          )
        )
        .limit(5);

      if (upcomingMilestones.length === 0) continue;

      const html = reminderEmailHtml(
        plan.userName,
        upcomingMilestones,
        `${baseUrl}/dashboard`
      );

      await resend.emails.send({
        from: emailFrom,
        to: plan.userEmail,
        subject: `NextNest: ${upcomingMilestones.length} upcoming milestone${upcomingMilestones.length === 1 ? "" : "s"}`,
        html,
      });

      await db.insert(notificationLog).values({
        userId: plan.userId,
        type: "reminder",
        subject: `${upcomingMilestones.length} upcoming milestones`,
      });

      sentCount++;
    }

    return NextResponse.json<ApiResponse<{ sentCount: number }>>(
      { data: { sentCount }, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notification send error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
