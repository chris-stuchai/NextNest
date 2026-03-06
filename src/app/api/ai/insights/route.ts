import { NextResponse } from "next/server";
import { generateText } from "ai";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  intakeResponses,
  relocationPlans,
  timelineMilestones,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOpenAI, INSIGHTS_SYSTEM_PROMPT } from "@/lib/ai";
import { daysUntil } from "@/lib/utils";
import type { ApiResponse } from "@/types";

export interface AiInsight {
  title: string;
  body: string;
}

/** GET /api/ai/insights — Generates personalized AI insights for the dashboard. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json<ApiResponse<AiInsight[]>>(
        { data: [], error: null, status: 200 },
        { status: 200 }
      );
    }

    const db = getDb();
    const userId = session.user.id;

    const [[intake], [plan], milestones] = await Promise.all([
      db
        .select()
        .from(intakeResponses)
        .where(eq(intakeResponses.userId, userId))
        .orderBy(desc(intakeResponses.createdAt))
        .limit(1),
      db
        .select()
        .from(relocationPlans)
        .where(eq(relocationPlans.userId, userId))
        .orderBy(desc(relocationPlans.createdAt))
        .limit(1),
      db
        .select()
        .from(timelineMilestones)
        .where(eq(timelineMilestones.userId, userId)),
    ]);

    if (!intake || !plan) {
      return NextResponse.json<ApiResponse<AiInsight[]>>(
        { data: [], error: null, status: 200 },
        { status: 200 }
      );
    }

    const completed = milestones.filter((m) => m.isCompleted).length;
    const total = milestones.length;
    const days = daysUntil(plan.targetDate);

    const openai = getOpenAI();

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: INSIGHTS_SYSTEM_PROMPT,
      prompt: `User moving from ${intake.movingFrom} to ${intake.movingTo}.
Move type: ${intake.moveType}. Target date: ${intake.targetMoveDate} (${days} days away).
Needs to sell: ${intake.needsToSell}. Pre-approval: ${intake.hasPreApproval}. Employment: ${intake.employmentSecured}.
Flexibility: ${intake.timelineFlexibility}. People: ${intake.peopleCount}. Concern: ${intake.topConcern || "none"}.
Progress: ${completed}/${total} milestones complete. Readiness: ${plan.readinessScore}/100.`,
    });

    let insights: AiInsight[] = [];
    try {
      insights = JSON.parse(result.text);
    } catch {
      insights = [];
    }

    return NextResponse.json<ApiResponse<AiInsight[]>>(
      { data: insights, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json<ApiResponse<AiInsight[]>>(
      { data: [], error: null, status: 200 },
      { status: 200 }
    );
  }
}
