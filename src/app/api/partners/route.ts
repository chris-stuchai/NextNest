import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { movePartners, relocationPlans, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET — Get all partners for the user's plan. */
export async function GET() {
  try {
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
  } catch (error) {
    console.error("Partners GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST — Invite a partner to the move. */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (email === session.user.email?.toLowerCase()) {
      return NextResponse.json({ error: "You can't invite yourself" }, { status: 400 });
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
  } catch (error) {
    console.error("Partners POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE — Remove a partner (only the inviter can remove). */
export async function DELETE(request: Request) {
  try {
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
  } catch (error) {
    console.error("Partners DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
