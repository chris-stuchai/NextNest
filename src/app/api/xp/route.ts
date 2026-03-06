import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userXp } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const XP_PER_MILESTONE = 25;
const XP_PER_LEVEL = 100;
const STREAK_BONUS_XP = 10;

/** GET — Get user's XP, level, and streak. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [xp] = await db
    .select()
    .from(userXp)
    .where(eq(userXp.userId, session.user.id))
    .limit(1);

  if (!xp) {
    const [created] = await db
      .insert(userXp)
      .values({ userId: session.user.id })
      .returning();
    return NextResponse.json({ data: created });
  }

  return NextResponse.json({ data: xp });
}

/** POST — Award XP for completing a task (called from milestone toggle). */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();
  if (action !== "milestone_complete") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const db = getDb();
  const [xp] = await db
    .select()
    .from(userXp)
    .where(eq(userXp.userId, session.user.id))
    .limit(1);

  const today = new Date().toISOString().split("T")[0];

  if (!xp) {
    const [created] = await db
      .insert(userXp)
      .values({
        userId: session.user.id,
        totalXp: XP_PER_MILESTONE,
        level: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      })
      .returning();
    return NextResponse.json({ data: created, xpGained: XP_PER_MILESTONE });
  }

  let streakBonus = 0;
  let newStreak = xp.currentStreak;
  let newLongest = xp.longestStreak;

  if (xp.lastActiveDate) {
    const lastDate = new Date(xp.lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      newStreak = xp.currentStreak + 1;
      streakBonus = STREAK_BONUS_XP;
    } else if (diffDays === 0) {
      newStreak = xp.currentStreak;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  newLongest = Math.max(newLongest, newStreak);

  const totalXpGained = XP_PER_MILESTONE + streakBonus;
  const newTotalXp = xp.totalXp + totalXpGained;
  const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;

  await db
    .update(userXp)
    .set({
      totalXp: newTotalXp,
      level: newLevel,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userXp.id, xp.id));

  return NextResponse.json({
    data: { totalXp: newTotalXp, level: newLevel, currentStreak: newStreak },
    xpGained: totalXpGained,
    streakBonus,
    levelUp: newLevel > xp.level,
  });
}
