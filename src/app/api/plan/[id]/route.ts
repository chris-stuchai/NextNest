import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  relocationPlans,
  timelineMilestones,
  budgetItems,
  intakeResponses,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ApiResponse, DashboardData } from "@/types";
import { daysUntil } from "@/lib/utils";

/** GET /api/plan/[id] — Returns full plan data for the dashboard. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDb();

    const [plan] = await db
      .select()
      .from(relocationPlans)
      .where(
        and(
          eq(relocationPlans.id, id),
          eq(relocationPlans.userId, session.user.id)
        )
      )
      .limit(1);

    if (!plan) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Plan not found", status: 404 },
        { status: 404 }
      );
    }

    const [milestoneList, budgetList, [intake]] = await Promise.all([
      db
        .select()
        .from(timelineMilestones)
        .where(eq(timelineMilestones.planId, id))
        .orderBy(timelineMilestones.sortOrder),
      db
        .select()
        .from(budgetItems)
        .where(eq(budgetItems.planId, id)),
      db
        .select()
        .from(intakeResponses)
        .where(eq(intakeResponses.userId, session.user.id))
        .orderBy(intakeResponses.createdAt)
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
    console.error("Plan fetch error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
