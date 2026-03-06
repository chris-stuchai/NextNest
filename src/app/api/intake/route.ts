import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { intakeResponses, relocationPlans } from "@/lib/db/schema";
import { intakeFormSchema } from "@/lib/validators";
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
