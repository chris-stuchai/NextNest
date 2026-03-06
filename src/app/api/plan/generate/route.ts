import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  intakeResponses,
  relocationPlans,
  timelineMilestones,
  budgetItems,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generateMilestones,
  generateBudgetItems,
  calculateReadinessScore,
} from "@/lib/plan-engine";
import type { ApiResponse, IntakeResponse } from "@/types";

/** POST /api/plan/generate — Generates milestones and budget items for a plan. */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "planId is required", status: 400 },
        { status: 400 }
      );
    }

    const db = getDb();

    const [intake] = await db
      .select()
      .from(intakeResponses)
      .where(eq(intakeResponses.userId, session.user.id))
      .orderBy(intakeResponses.createdAt)
      .limit(1);

    if (!intake) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "No intake found", status: 404 },
        { status: 404 }
      );
    }

    const milestoneData = generateMilestones(intake as IntakeResponse, planId);
    const budgetData = generateBudgetItems(intake as IntakeResponse, planId);
    const readinessScore = calculateReadinessScore(intake as IntakeResponse);

    if (milestoneData.length > 0) {
      await db.insert(timelineMilestones).values(milestoneData);
    }

    if (budgetData.length > 0) {
      await db.insert(budgetItems).values(budgetData);
    }

    await db
      .update(relocationPlans)
      .set({ readinessScore, updatedAt: new Date() })
      .where(eq(relocationPlans.id, planId));

    return NextResponse.json<ApiResponse>(
      { data: { planId, readinessScore }, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
