import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { moveExpenses } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

/** GET — Retrieve the user's tagged move expenses. */
export async function GET() {
  try {
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
  } catch (error) {
    console.error("Expenses GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST — Add a move expense (manual or from Plaid transaction). */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, amount, category, date, plaidTransactionId, notes } = body;

    if (!name || amount == null || !category || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const db = getDb();
    const [expense] = await db
      .insert(moveExpenses)
      .values({
        userId: session.user.id,
        name: String(name).slice(0, 500),
        amount: parsedAmount,
        category: String(category).slice(0, 100),
        date,
        plaidTransactionId: plaidTransactionId ?? null,
        notes: notes ? String(notes).slice(0, 1000) : null,
      })
      .returning();

    return NextResponse.json({ data: expense });
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE — Remove a tagged expense (scoped to current user). */
export async function DELETE(request: Request) {
  try {
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
    await db
      .delete(moveExpenses)
      .where(and(eq(moveExpenses.id, id), eq(moveExpenses.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Expenses DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
