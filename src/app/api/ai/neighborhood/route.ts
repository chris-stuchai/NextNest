import { NextResponse } from "next/server";
import { generateText } from "ai";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { intakeResponses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import type { ApiResponse } from "@/types";

export interface NeighborhoodComparison {
  origin: LocationProfile;
  destination: LocationProfile;
  keyDifferences: string[];
  tips: string[];
}

export interface LocationProfile {
  name: string;
  costOfLiving: string;
  climate: string;
  transitScore: string;
  highlights: string[];
}

const SYSTEM_PROMPT = `You are a relocation research analyst. Given two locations, provide a helpful comparison to prepare someone for their move.

Return ONLY valid JSON with this exact structure:
{
  "origin": {
    "name": "City, State",
    "costOfLiving": "Brief assessment relative to national average",
    "climate": "Brief climate description",
    "transitScore": "Brief transit/walkability assessment",
    "highlights": ["3-4 notable characteristics"]
  },
  "destination": {
    "name": "City, State",
    "costOfLiving": "Brief assessment relative to national average",
    "climate": "Brief climate description",
    "transitScore": "Brief transit/walkability assessment",
    "highlights": ["3-4 notable characteristics"]
  },
  "keyDifferences": ["4-5 important differences to know about"],
  "tips": ["3-4 practical tips for adjusting to the new location"]
}

Be factual, practical, and encouraging. No markdown.`;

/** POST /api/ai/neighborhood — Generates an origin vs destination comparison. */
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
      prompt: `Compare these locations for someone relocating:
Origin: ${intake.movingFrom}
Destination: ${intake.movingTo}
Move type: ${intake.moveType} (${intake.moveType === "buy" ? "buying" : "renting"})
Household size: ${intake.peopleCount}
Top concern: ${intake.topConcern || "general adjustment"}`,
    });

    let comparison: NeighborhoodComparison;
    try {
      comparison = JSON.parse(result.text);
    } catch {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Failed to parse AI response", status: 500 },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<NeighborhoodComparison>>({
      data: comparison,
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Neighborhood comparison error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
