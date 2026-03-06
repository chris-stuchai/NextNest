import { streamText, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { intakeResponses, leaseDocuments, userBudgets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAnthropic, AI_MODEL, MOVE_ADVISOR_SYSTEM_PROMPT } from "@/lib/ai";

/** POST /api/ai/chat — Streaming AI Move Advisor powered by Claude, enriched with lease + budget context. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages: rawMessages } = await request.json();
  const messages = await convertToModelMessages(rawMessages);

  const db = getDb();
  const [intake, lease, budget] = await Promise.all([
    db
      .select()
      .from(intakeResponses)
      .where(eq(intakeResponses.userId, session.user.id))
      .orderBy(desc(intakeResponses.createdAt))
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(leaseDocuments)
      .where(eq(leaseDocuments.userId, session.user.id))
      .orderBy(desc(leaseDocuments.createdAt))
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(userBudgets)
      .where(eq(userBudgets.userId, session.user.id))
      .limit(1)
      .then((r) => r[0]),
  ]);

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

  if (budget) {
    systemPrompt += `\n\nUser's budget:
- Total moving budget: $${budget.totalBudget.toLocaleString()}${budget.housingBudget ? `\n- Housing budget: $${budget.housingBudget.toLocaleString()}` : ""}${budget.movingBudget ? `\n- Moving/logistics budget: $${budget.movingBudget.toLocaleString()}` : ""}${budget.travelBudget ? `\n- Travel budget: $${budget.travelBudget.toLocaleString()}` : ""}${budget.emergencyFund ? `\n- Emergency fund: $${budget.emergencyFund.toLocaleString()}` : ""}
IMPORTANT: Always respect this budget. Suggest cost-saving alternatives when recommendations exceed the user's stated budget. Never push them beyond what they can afford.`;
  }

  if (lease?.extractedData && lease.status === "completed") {
    const ld = lease.extractedData as Record<string, unknown>;
    systemPrompt += `\n\nLease information (AI-extracted from their lease):
${ld.summary ? `- Summary: ${ld.summary}` : ""}${ld.leaseEndDate ? `\n- Lease end date: ${ld.leaseEndDate}` : ""}${ld.monthlyRent ? `\n- Monthly rent: $${ld.monthlyRent}` : ""}${ld.securityDeposit ? `\n- Security deposit: $${ld.securityDeposit}` : ""}${ld.noticeRequired ? `\n- Notice required: ${ld.noticeRequired}` : ""}${Array.isArray(ld.moveOutChecklist) && ld.moveOutChecklist.length > 0 ? `\n- Move-out checklist: ${(ld.moveOutChecklist as string[]).join("; ")}` : ""}${Array.isArray(ld.cleaningRequirements) && ld.cleaningRequirements.length > 0 ? `\n- Cleaning requirements: ${(ld.cleaningRequirements as string[]).join("; ")}` : ""}
Use this lease data to give specific, accurate advice about their move-out obligations, timing, and deposit recovery.`;
  }

  const anthropic = getAnthropic();

  const result = streamText({
    model: anthropic(AI_MODEL),
    system: systemPrompt,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
