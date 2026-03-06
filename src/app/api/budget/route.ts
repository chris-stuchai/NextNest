import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  userBudgets,
  intakeResponses,
  relocationPlans,
  budgetItems,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { regenerateBudgetForConstraints } from "@/lib/ai-plan-engine";
import type { IntakeResponse } from "@/types";

/** GET — Retrieve the user's budget. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [budget] = await db
    .select()
    .from(userBudgets)
    .where(eq(userBudgets.userId, session.user.id))
    .limit(1);

  return NextResponse.json({ data: budget ?? null });
}

/** POST — Create or update the user's budget, then regenerate AI cost estimates to fit. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { totalBudget, housingBudget, movingBudget, travelBudget, emergencyFund, notes } = body;

  if (!totalBudget || totalBudget <= 0) {
    return NextResponse.json({ error: "A total budget is required" }, { status: 400 });
  }

  const db = getDb();

  const [existing] = await db
    .select()
    .from(userBudgets)
    .where(eq(userBudgets.userId, session.user.id))
    .limit(1);

  if (existing) {
    await db
      .update(userBudgets)
      .set({
        totalBudget,
        housingBudget: housingBudget ?? null,
        movingBudget: movingBudget ?? null,
        travelBudget: travelBudget ?? null,
        emergencyFund: emergencyFund ?? null,
        notes: notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(userBudgets.id, existing.id));
  } else {
    await db.insert(userBudgets).values({
      userId: session.user.id,
      totalBudget,
      housingBudget: housingBudget ?? null,
      movingBudget: movingBudget ?? null,
      travelBudget: travelBudget ?? null,
      emergencyFund: emergencyFund ?? null,
      notes: notes ?? null,
    });
  }

  // Regenerate budget items based on the user's real budget
  const [intake, plan] = await Promise.all([
    db
      .select()
      .from(intakeResponses)
      .where(eq(intakeResponses.userId, session.user.id))
      .orderBy(desc(intakeResponses.createdAt))
      .limit(1)
      .then((r) => r[0]),
    db
      .select()
      .from(relocationPlans)
      .where(eq(relocationPlans.userId, session.user.id))
      .orderBy(desc(relocationPlans.createdAt))
      .limit(1)
      .then((r) => r[0]),
  ]);

  if (intake && plan) {
    const newItems = await regenerateBudgetForConstraints(
      intake as IntakeResponse,
      plan.id,
      { totalBudget, housingBudget, movingBudget, travelBudget, emergencyFund }
    );

    if (newItems && newItems.length > 0) {
      await db.delete(budgetItems).where(eq(budgetItems.planId, plan.id));
      await db.insert(budgetItems).values(newItems);
    }
  }

  return NextResponse.json({ data: { totalBudget }, regenerated: true });
}
