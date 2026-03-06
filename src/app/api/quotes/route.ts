import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { movingQuotes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/** Returns all moving quotes for the authenticated user. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const quotes = await db
    .select()
    .from(movingQuotes)
    .where(eq(movingQuotes.userId, session.user.id))
    .orderBy(desc(movingQuotes.createdAt));

  return NextResponse.json({ data: quotes });
}
