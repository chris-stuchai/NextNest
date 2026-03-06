import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  relocationPlans,
  timelineMilestones,
  budgetItems,
  intakeResponses,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { daysUntil } from "@/lib/utils";
import type { ApiResponse, DashboardData } from "@/types";

/** GET /api/dashboard — Returns the latest plan and all associated data for the current user. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const db = getDb();

    const [plan] = await db
      .select()
      .from(relocationPlans)
      .where(eq(relocationPlans.userId, session.user.id))
      .orderBy(desc(relocationPlans.createdAt))
      .limit(1);

    if (!plan) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "No plan found. Complete the intake first.", status: 404 },
        { status: 404 }
      );
    }

    const [milestoneList, budgetList, [intake]] = await Promise.all([
      db
        .select()
        .from(timelineMilestones)
        .where(eq(timelineMilestones.planId, plan.id))
        .orderBy(timelineMilestones.sortOrder),
      db
        .select()
        .from(budgetItems)
        .where(eq(budgetItems.planId, plan.id)),
      db
        .select()
        .from(intakeResponses)
        .where(eq(intakeResponses.userId, session.user.id))
        .orderBy(desc(intakeResponses.createdAt))
        .limit(1),
    ]);

    const dashboardData: DashboardData = {
      plan,
      milestones: milestoneList,
      budgetItems: budgetList,
      intake: intake,
      daysUntilMove: daysUntil(plan.targetDate),
    };

    return NextResponse.json<ApiResponse<DashboardData>>(
      { data: dashboardData, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
