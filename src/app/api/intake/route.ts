import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { intakeResponses, relocationPlans } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { intakeFormSchema, intakeUpdateSchema } from "@/lib/validators";
import type { ApiResponse } from "@/types";

/** POST /api/intake — Saves intake responses and creates a relocation plan. */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = intakeFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        {
          data: null,
          error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
          status: 400,
        },
        { status: 400 }
      );
    }

    const db = getDb();

    const [intake] = await db
      .insert(intakeResponses)
      .values({
        userId: session.user.id,
        movingFrom: parsed.data.movingFrom,
        movingTo: parsed.data.movingTo,
        targetMoveDate: parsed.data.targetMoveDate,
        moveType: parsed.data.moveType,
        needsToSell: parsed.data.needsToSell,
        hasPreApproval: parsed.data.hasPreApproval,
        employmentSecured: parsed.data.employmentSecured,
        timelineFlexibility: parsed.data.timelineFlexibility,
        peopleCount: parsed.data.peopleCount,
        topConcern: parsed.data.topConcern,
      })
      .returning({ id: intakeResponses.id });

    const [plan] = await db
      .insert(relocationPlans)
      .values({
        userId: session.user.id,
        targetDate: parsed.data.targetMoveDate,
        readinessScore: 0,
        planConfig: { intakeId: intake.id },
      })
      .returning({ id: relocationPlans.id });

    return NextResponse.json<ApiResponse<{ intakeId: string; planId: string }>>(
      {
        data: { intakeId: intake.id, planId: plan.id },
        error: null,
        status: 201,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Intake submission error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}

/** PATCH /api/intake — Updates the user's latest intake (locations and timeline). */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = intakeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        {
          data: null,
          error: parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
          status: 400,
        },
        { status: 400 }
      );
    }

    const db = getDb();

    const [latestIntake] = await db
      .select()
      .from(intakeResponses)
      .where(eq(intakeResponses.userId, session.user.id))
      .orderBy(desc(intakeResponses.createdAt))
      .limit(1);

    if (!latestIntake) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "No intake found. Complete the intake first.", status: 404 },
        { status: 404 }
      );
    }

    const updateData: Record<string, string> = {};
    if (parsed.data.movingFrom !== undefined) updateData.movingFrom = parsed.data.movingFrom;
    if (parsed.data.movingTo !== undefined) updateData.movingTo = parsed.data.movingTo;
    if (parsed.data.targetMoveDate !== undefined)
      updateData.targetMoveDate = parsed.data.targetMoveDate;

    const [updatedIntake] = await db
      .update(intakeResponses)
      .set(updateData)
      .where(eq(intakeResponses.id, latestIntake.id))
      .returning();

    if (!updatedIntake) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Failed to update intake", status: 500 },
        { status: 500 }
      );
    }

    if (parsed.data.targetMoveDate !== undefined) {
      const [latestPlan] = await db
        .select({ id: relocationPlans.id })
        .from(relocationPlans)
        .where(eq(relocationPlans.userId, session.user.id))
        .orderBy(desc(relocationPlans.createdAt))
        .limit(1);

      if (latestPlan) {
        await db
          .update(relocationPlans)
          .set({ targetDate: parsed.data.targetMoveDate, updatedAt: new Date() })
          .where(eq(relocationPlans.id, latestPlan.id));
      }
    }

    return NextResponse.json<ApiResponse<typeof updatedIntake>>(
      { data: updatedIntake, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Intake PATCH error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
