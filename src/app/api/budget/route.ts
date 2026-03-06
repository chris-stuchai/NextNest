import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userBudgets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

/** POST — Create or update the user's budget. */
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

    return NextResponse.json({ data: { ...existing, totalBudget } });
  }

  const [budget] = await db
    .insert(userBudgets)
    .values({
      userId: session.user.id,
      totalBudget,
      housingBudget: housingBudget ?? null,
      movingBudget: movingBudget ?? null,
      travelBudget: travelBudget ?? null,
      emergencyFund: emergencyFund ?? null,
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json({ data: budget });
}
