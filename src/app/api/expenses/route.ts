import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { moveExpenses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/** GET — Retrieve the user's tagged move expenses. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const expenses = await db
    .select()
    .from(moveExpenses)
    .where(eq(moveExpenses.userId, session.user.id))
    .orderBy(desc(moveExpenses.createdAt));

  return NextResponse.json({ data: expenses });
}

/** POST — Add a move expense (manual or from Plaid transaction). */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, amount, category, date, plaidTransactionId, notes } = body;

  if (!name || !amount || !category || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const [expense] = await db
    .insert(moveExpenses)
    .values({
      userId: session.user.id,
      name,
      amount: Math.round(amount),
      category,
      date,
      plaidTransactionId: plaidTransactionId ?? null,
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json({ data: expense });
}

/** DELETE — Remove a tagged expense. */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
  }

  const db = getDb();
  await db.delete(moveExpenses).where(eq(moveExpenses.id, id));

  return NextResponse.json({ success: true });
}
