import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users,
  relocationPlans,
  timelineMilestones,
  budgetItems,
  intakeResponses,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { daysUntil } from "@/lib/utils";
import type { ApiResponse, DashboardData } from "@/types";

/** GET /api/admin/users/[id]/dashboard — Returns a user's full plan data for admin viewing. */
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

    const db = getDb();

    const [currentUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (currentUser?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Forbidden", status: 403 },
        { status: 403 }
      );
    }

    const { id: targetUserId } = await params;

    const [plan] = await db
      .select()
      .from(relocationPlans)
      .where(eq(relocationPlans.userId, targetUserId))
      .orderBy(desc(relocationPlans.createdAt))
      .limit(1);

    if (!plan) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "No plan found for this user", status: 404 },
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
        .where(eq(intakeResponses.userId, targetUserId))
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
    console.error("Admin user dashboard error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
