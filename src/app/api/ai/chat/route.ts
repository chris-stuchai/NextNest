import { streamText } from "ai";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { intakeResponses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOpenAI, MOVE_ADVISOR_SYSTEM_PROMPT } from "@/lib/ai";

/** POST /api/ai/chat — Streaming AI Move Advisor powered by OpenAI. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await request.json();

  const db = getDb();
  const [intake] = await db
    .select()
    .from(intakeResponses)
    .where(eq(intakeResponses.userId, session.user.id))
    .orderBy(desc(intakeResponses.createdAt))
    .limit(1);

  // Enrich the system prompt with user context when available
  let systemPrompt = MOVE_ADVISOR_SYSTEM_PROMPT;
  if (intake) {
    systemPrompt += `\n\nUser's move details:
- Moving from: ${intake.movingFrom}
- Moving to: ${intake.movingTo}
- Target move date: ${intake.targetMoveDate}
- Move type: ${intake.moveType === "buy" ? "Buying a home" : "Renting"}
- Needs to sell current home: ${intake.needsToSell ? "Yes" : "No"}
- Has mortgage pre-approval: ${intake.hasPreApproval ? "Yes" : "No"}
- Employment secured: ${intake.employmentSecured ? "Yes" : "No"}
- Timeline flexibility: ${intake.timelineFlexibility}
- People moving: ${intake.peopleCount}
- Top concern: ${intake.topConcern || "Not specified"}`;
  }

  const openai = getOpenAI();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
