import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { movePartners, relocationPlans, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

/** GET — Get all partners for the user's plan. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [plan] = await db
    .select()
    .from(relocationPlans)
    .where(eq(relocationPlans.userId, session.user.id))
    .orderBy(desc(relocationPlans.createdAt))
    .limit(1);

  if (!plan) return NextResponse.json({ data: [] });

  const partners = await db
    .select({
      id: movePartners.id,
      email: movePartners.email,
      status: movePartners.status,
      createdAt: movePartners.createdAt,
      partnerName: users.name,
    })
    .from(movePartners)
    .leftJoin(users, eq(movePartners.partnerId, users.id))
    .where(eq(movePartners.planId, plan.id));

  return NextResponse.json({ data: partners });
}

/** POST — Invite a partner to the move. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const db = getDb();
  const [plan] = await db
    .select()
    .from(relocationPlans)
    .where(eq(relocationPlans.userId, session.user.id))
    .orderBy(desc(relocationPlans.createdAt))
    .limit(1);

  if (!plan) {
    return NextResponse.json({ error: "No plan found" }, { status: 404 });
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const [partner] = await db
    .insert(movePartners)
    .values({
      planId: plan.id,
      invitedBy: session.user.id,
      email,
      partnerId: existingUser?.id ?? null,
      status: existingUser ? "active" : "pending",
    })
    .returning();

  return NextResponse.json({ data: partner });
}

/** DELETE — Remove a partner. */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const db = getDb();
  await db.delete(movePartners).where(
    and(eq(movePartners.id, id), eq(movePartners.invitedBy, session.user.id))
  );

  return NextResponse.json({ success: true });
}
