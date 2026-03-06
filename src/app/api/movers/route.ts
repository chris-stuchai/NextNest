import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { intakeResponses, userBudgets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import { generateText } from "ai";

const MOVER_FINDER_PROMPT = `You are a moving company research assistant. Based on the user's move details, recommend 5 moving companies or services that would be a good fit.

For each recommendation, provide ONLY a valid JSON array (no markdown, no explanation) with objects containing:
{
  "name": "Company Name",
  "type": "full-service | labor-only | truck-rental | pod-storage | specialty",
  "priceRange": "$X,XXX - $X,XXX",
  "bestFor": "1-sentence why this fits the user",
  "website": "company website URL",
  "phone": "phone number if known",
  "rating": 4.5,
  "pros": ["pro 1", "pro 2"],
  "cons": ["con 1"]
}

Consider the user's:
- Origin and destination (distance, interstate vs local)
- Budget constraints
- Number of people / household size
- Timeline
- Move type (buying vs renting affects complexity)

Recommend a mix of options: at least one budget-friendly, one premium, and one middle-ground. Include national carriers and local options when possible.`;

/** POST — AI-powered mover recommendations based on user's data. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [intake, budget] = await Promise.all([
    db
      .select()
      .from(intakeResponses)
      .where(eq(intakeResponses.userId, session.user.id))
      .orderBy(desc(intakeResponses.createdAt))
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(userBudgets)
      .where(eq(userBudgets.userId, session.user.id))
      .limit(1)
      .then((r) => r[0]),
  ]);

  if (!intake) {
    return NextResponse.json({ error: "Complete intake first" }, { status: 400 });
  }

  const userContext = `Move details:
- From: ${intake.movingFrom}
- To: ${intake.movingTo}
- Date: ${intake.targetMoveDate}
- Type: ${intake.moveType}
- People: ${intake.peopleCount}
- Timeline flexibility: ${intake.timelineFlexibility}
${budget ? `- Budget: $${budget.totalBudget.toLocaleString()}${budget.movingBudget ? ` (moving budget: $${budget.movingBudget.toLocaleString()})` : ""}` : "- Budget: Not specified"}`;

  try {
    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: MOVER_FINDER_PROMPT,
      prompt: userContext,
    });

    let recommendations;
    try {
      recommendations = JSON.parse(result.text);
    } catch {
      recommendations = [];
    }

    return NextResponse.json({ data: recommendations });
  } catch (error) {
    console.error("Mover finder error:", error);
    return NextResponse.json({ error: "Failed to find movers" }, { status: 500 });
  }
}
