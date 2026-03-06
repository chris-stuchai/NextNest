import type {
  IntakeResponse,
  NewTimelineMilestone,
  NewBudgetItem,
} from "@/types";
import { milestoneTemplates } from "@/constants/milestone-templates";
import { budgetTemplates } from "@/constants/budget-templates";

/**
 * Determines which milestone condition tokens apply based on intake data.
 * Returns a Set of conditions that match the user's situation.
 */
function getActiveConditions(intake: IntakeResponse): Set<string> {
  const conditions = new Set<string>();

  if (intake.moveType === "buy") conditions.add("buying");
  if (intake.moveType === "rent") conditions.add("renting");
  if (intake.needsToSell) conditions.add("selling");
  if (!intake.hasPreApproval && intake.moveType === "buy")
    conditions.add("no-preapproval");
  if (!intake.employmentSecured) conditions.add("no-employment");

  return conditions;
}

/** Adds the specified number of months to a date and returns an ISO date string. */
function addMonths(date: Date, months: number): string {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().split("T")[0];
}

/**
 * Generates timeline milestones from templates, filtered by the user's
 * intake responses and ordered chronologically.
 */
export function generateMilestones(
  intake: IntakeResponse,
  planId: string
): NewTimelineMilestone[] {
  const activeConditions = getActiveConditions(intake);
  const moveDate = new Date(intake.targetMoveDate);

  const filtered = milestoneTemplates.filter((template) => {
    if (!template.condition) return true;
    return activeConditions.has(template.condition);
  });

  const sorted = [...filtered].sort(
    (a, b) => b.monthsBeforeMove - a.monthsBeforeMove
  );

  return sorted.map((template, index) => ({
    planId,
    userId: intake.userId,
    title: template.title,
    description: template.description,
    targetDate: addMonths(moveDate, -template.monthsBeforeMove),
    sortOrder: index,
    category: template.category,
    isCompleted: false,
  }));
}

/**
 * Generates budget items from templates, filtered by whether the user
 * is buying, renting, or selling.
 */
export function generateBudgetItems(
  intake: IntakeResponse,
  planId: string
): NewBudgetItem[] {
  const activeConditions = getActiveConditions(intake);

  return budgetTemplates
    .filter((template) => {
      if (!template.condition) return true;
      return activeConditions.has(template.condition);
    })
    .map((template) => ({
      planId,
      userId: intake.userId,
      category: template.category,
      label: template.label,
      estimatedLow: template.estimatedLow,
      estimatedHigh: template.estimatedHigh,
      notes: template.notes,
    }));
}

/**
 * Calculates the initial readiness score (0–100) based on how many
 * favorable conditions the user already has locked in.
 */
export function calculateReadinessScore(intake: IntakeResponse): number {
  let score = 10; // Starting baseline for completing the intake

  if (intake.hasPreApproval) score += 15;
  if (intake.employmentSecured) score += 15;
  if (!intake.needsToSell) score += 10;
  if (intake.moveType === "rent") score += 5; // Renting is simpler

  // Bonus for having more lead time
  const moveDate = new Date(intake.targetMoveDate);
  const now = new Date();
  const monthsUntilMove =
    (moveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsUntilMove > 6) score += 10;
  else if (monthsUntilMove > 3) score += 5;

  return Math.min(score, 100);
}
