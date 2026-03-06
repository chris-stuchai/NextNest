import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  timelineMilestones,
  relocationPlans,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { milestoneUpdateSchema } from "@/lib/validators";
import type { ApiResponse } from "@/types";

/** PATCH /api/milestones/[id] — Toggles milestone completion status. */
export async function PATCH(
  request: Request,
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
    const body = await request.json();
    const parsed = milestoneUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Invalid input", status: 400 },
        { status: 400 }
      );
    }

    const db = getDb();

    const [milestone] = await db
      .update(timelineMilestones)
      .set({
        isCompleted: parsed.data.isCompleted,
        completedAt: parsed.data.isCompleted ? new Date() : null,
      })
      .where(
        and(
          eq(timelineMilestones.id, id),
          eq(timelineMilestones.userId, session.user.id)
        )
      )
      .returning();

    if (!milestone) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Milestone not found", status: 404 },
        { status: 404 }
      );
    }

    // Recalculate readiness score based on milestone completion percentage
    const allMilestones = await db
      .select()
      .from(timelineMilestones)
      .where(eq(timelineMilestones.planId, milestone.planId));

    const completed = allMilestones.filter((m) => m.isCompleted).length;
    const total = allMilestones.length;
    const milestoneBonus = total > 0 ? Math.round((completed / total) * 60) : 0;
    // Base score from intake (~10-55) + milestone progress (0-60), capped at 100
    const newScore = Math.min(40 + milestoneBonus, 100);

    await db
      .update(relocationPlans)
      .set({ readinessScore: newScore, updatedAt: new Date() })
      .where(eq(relocationPlans.id, milestone.planId));

    return NextResponse.json<ApiResponse>(
      {
        data: { milestone, readinessScore: newScore },
        error: null,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Milestone update error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
