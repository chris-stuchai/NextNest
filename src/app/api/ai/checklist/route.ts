import { NextResponse } from "next/server";
import { generateText } from "ai";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { intakeResponses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import type { ApiResponse } from "@/types";

export interface ChecklistItem {
  task: string;
  timeframe: string;
  priority: "high" | "medium" | "low";
  tip: string;
}

const SYSTEM_PROMPT = `You are a relocation planning expert. Generate a personalized pre-move checklist based on the user's specific situation.

Rules:
- Generate exactly 10 actionable checklist items
- Tailor to their origin/destination, move type, and circumstances
- Include specific local tips (e.g., utility providers, DMV, parking permits)
- Order by urgency/timeline
- Each item needs a practical tip unique to their situation

Return ONLY a JSON array of objects with: task (string), timeframe (e.g., "2 weeks before"), priority ("high" | "medium" | "low"), tip (string, one practical sentence). No markdown.`;

/** POST /api/ai/checklist — Generates a personalized pre-move checklist. */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "AI features require configuration", status: 503 },
        { status: 503 }
      );
    }

    const db = getDb();
    const [intake] = await db
      .select()
      .from(intakeResponses)
      .where(eq(intakeResponses.userId, session.user.id))
      .orderBy(desc(intakeResponses.createdAt))
      .limit(1);

    if (!intake) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Complete your intake first", status: 400 },
        { status: 400 }
      );
    }

    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: SYSTEM_PROMPT,
      prompt: `User is moving from ${intake.movingFrom} to ${intake.movingTo}.
Move date: ${intake.targetMoveDate}. Move type: ${intake.moveType}.
Selling current home: ${intake.needsToSell}. Pre-approved: ${intake.hasPreApproval}.
Employment secured: ${intake.employmentSecured}. People: ${intake.peopleCount}.
Timeline flexibility: ${intake.timelineFlexibility}. Concern: ${intake.topConcern || "general moving"}.`,
    });

    let checklist: ChecklistItem[] = [];
    try {
      checklist = JSON.parse(result.text);
    } catch {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Failed to parse AI response", status: 500 },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<ChecklistItem[]>>({
      data: checklist,
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Checklist generation error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
