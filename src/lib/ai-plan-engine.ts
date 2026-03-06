import { generateText } from "ai";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import type {
  IntakeResponse,
  NewTimelineMilestone,
  NewBudgetItem,
} from "@/types";

interface AiMilestone {
  title: string;
  description: string;
  monthsBeforeMove: number;
  category: "housing" | "finance" | "logistics" | "admin";
}

interface AiBudgetItem {
  label: string;
  category: "housing" | "finance" | "logistics" | "admin";
  estimatedLow: number;
  estimatedHigh: number;
  notes: string;
}

const MILESTONE_PROMPT = `You are a relocation planning expert. Given a user's move details, generate 8-12 personalized timeline milestones for their move.

Rules:
- Each milestone must be specific to their origin, destination, and situation
- Include location-specific tasks (e.g., "Research neighborhoods in [destination]")
- Consider their move type (buy vs rent), household size, and concerns
- Set realistic monthsBeforeMove values (0-12)
- Categories: "housing", "finance", "logistics", "admin"
- Be practical and actionable, not generic

Return ONLY a JSON array of objects with fields: title (string), description (string), monthsBeforeMove (number), category (string). No markdown.`;

const BUDGET_PROMPT = `You are a relocation cost estimation expert. Given a user's move details, generate 6-10 personalized budget line items.

Rules:
- Estimate realistic costs for their specific route (origin → destination)
- Consider cost of living differences between locations
- Account for household size and move type (buy vs rent)
- Include location-specific costs (e.g., state-specific closing costs, local moving rates)
- Give low and high estimates that reflect real market ranges
- Categories: "housing", "finance", "logistics", "admin"

Return ONLY a JSON array of objects with fields: label (string), category (string), estimatedLow (number), estimatedHigh (number), notes (string). No markdown.`;

const BUDGET_CONSTRAINED_PROMPT = `You are a relocation cost optimization expert. The user has a FIXED BUDGET and you must help them move within it.

Rules:
- The total of all estimatedHigh values MUST NOT exceed the user's total budget
- Prioritize the cheapest viable options for their route
- Suggest specific money-saving strategies in the notes (e.g., "DIY packing saves $X", "Move mid-week for 20% discount")
- If the budget is very tight, be creative: suggest labor-only movers + truck rental, off-peak moving dates, free packing materials, etc.
- Be honest if something is unrealistic, but always provide the cheapest path forward
- Categories: "housing", "finance", "logistics", "admin"
- Every item should feel achievable, not aspirational

Return ONLY a JSON array of objects with fields: label (string), category (string), estimatedLow (number), estimatedHigh (number), notes (string). No markdown.`;

function buildUserContext(intake: IntakeResponse): string {
  return `Moving from: ${intake.movingFrom}
Moving to: ${intake.movingTo}
Target date: ${intake.targetMoveDate}
Move type: ${intake.moveType === "buy" ? "Buying a home" : "Renting"}
Needs to sell current home: ${intake.needsToSell ? "Yes" : "No"}
Mortgage pre-approval: ${intake.hasPreApproval ? "Yes" : "No"}
Employment secured: ${intake.employmentSecured ? "Yes" : "No"}
Timeline flexibility: ${intake.timelineFlexibility}
People moving: ${intake.peopleCount}
Top concern: ${intake.topConcern || "General relocation"}`;
}

/**
 * Uses AI to generate personalized milestones. Falls back gracefully
 * if the API key is missing or the call fails (caller should use template fallback).
 */
export async function generateAiMilestones(
  intake: IntakeResponse,
  planId: string
): Promise<NewTimelineMilestone[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: MILESTONE_PROMPT,
      prompt: buildUserContext(intake),
    });

    const parsed: AiMilestone[] = JSON.parse(result.text);
    const moveDate = new Date(intake.targetMoveDate);

    return parsed.map((m, index) => {
      const targetDate = new Date(moveDate);
      targetDate.setMonth(targetDate.getMonth() - m.monthsBeforeMove);

      return {
        planId,
        userId: intake.userId,
        title: m.title,
        description: m.description,
        targetDate: targetDate.toISOString().split("T")[0],
        sortOrder: index,
        category: m.category,
        isCompleted: false,
      };
    });
  } catch (error) {
    console.error("AI milestone generation failed, falling back to templates:", error);
    return null;
  }
}

/**
 * Uses AI to generate personalized budget estimates. Falls back gracefully
 * if the API key is missing or the call fails.
 */
export async function generateAiBudgetItems(
  intake: IntakeResponse,
  planId: string
): Promise<NewBudgetItem[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: BUDGET_PROMPT,
      prompt: buildUserContext(intake),
    });

    const parsed: AiBudgetItem[] = JSON.parse(result.text);

    return parsed.map((b) => ({
      planId,
      userId: intake.userId,
      category: b.category,
      label: b.label,
      estimatedLow: b.estimatedLow,
      estimatedHigh: b.estimatedHigh,
      notes: b.notes,
    }));
  } catch (error) {
    console.error("AI budget generation failed, falling back to templates:", error);
    return null;
  }
}

interface BudgetConstraints {
  totalBudget: number;
  housingBudget?: number | null;
  movingBudget?: number | null;
  travelBudget?: number | null;
  emergencyFund?: number | null;
}

/**
 * Regenerates budget items constrained to the user's actual budget.
 * The AI will find the cheapest viable path and suggest cost-saving alternatives.
 */
export async function regenerateBudgetForConstraints(
  intake: IntakeResponse,
  planId: string,
  budget: BudgetConstraints
): Promise<NewBudgetItem[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const budgetContext = `${buildUserContext(intake)}

USER'S ACTUAL BUDGET:
- Total budget: $${budget.totalBudget.toLocaleString()}${budget.housingBudget ? `\n- Housing budget: $${budget.housingBudget.toLocaleString()}` : ""}${budget.movingBudget ? `\n- Moving/logistics budget: $${budget.movingBudget.toLocaleString()}` : ""}${budget.travelBudget ? `\n- Travel budget: $${budget.travelBudget.toLocaleString()}` : ""}${budget.emergencyFund ? `\n- Emergency fund: $${budget.emergencyFund.toLocaleString()}` : ""}

CRITICAL: The sum of all estimatedHigh values must stay WITHIN $${budget.totalBudget.toLocaleString()}. Find the cheapest realistic options.`;

    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: BUDGET_CONSTRAINED_PROMPT,
      prompt: budgetContext,
    });

    const parsed: AiBudgetItem[] = JSON.parse(result.text);

    return parsed.map((b) => ({
      planId,
      userId: intake.userId,
      category: b.category,
      label: b.label,
      estimatedLow: b.estimatedLow,
      estimatedHigh: b.estimatedHigh,
      notes: b.notes,
    }));
  } catch (error) {
    console.error("Budget-constrained regeneration failed:", error);
    return null;
  }
}
