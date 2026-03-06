import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  intakeResponses,
  relocationPlans,
  timelineMilestones,
  budgetItems,
  notificationLog,
  leaseDocuments,
  moveOutPhotos,
  userBudgets,
  plaidConnections,
  moveExpenses,
  movePartners,
  userXp,
  movingQuotes,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

/** GET /api/account — GDPR data export: returns all data associated with the authenticated user. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const db = getDb();
    const userId = session.user.id;

    const [userData, intakeData, planData, milestoneData, budgetData, notifData] =
      await Promise.all([
        db.select().from(users).where(eq(users.id, userId)).limit(1),
        db.select().from(intakeResponses).where(eq(intakeResponses.userId, userId)),
        db.select().from(relocationPlans).where(eq(relocationPlans.userId, userId)),
        db.select().from(timelineMilestones).where(eq(timelineMilestones.userId, userId)),
        db.select().from(budgetItems).where(eq(budgetItems.userId, userId)),
        db.select().from(notificationLog).where(eq(notificationLog.userId, userId)),
      ]);

    return NextResponse.json<ApiResponse>({
      data: {
        user: userData[0] ?? null,
        intakeResponses: intakeData,
        relocationPlans: planData,
        milestones: milestoneData,
        budgetItems: budgetData,
        notificationLog: notifData,
        exportedAt: new Date().toISOString(),
      },
      error: null,
      status: 200,
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}

/** DELETE /api/account — GDPR right to erasure: permanently deletes all user data. */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Unauthorized", status: 401 },
        { status: 401 }
      );
    }

    const db = getDb();
    const userId = session.user.id;

    // Delete all user data in dependency order (leaf tables first).
    await db.delete(userXp).where(eq(userXp.userId, userId));
    await db.delete(moveExpenses).where(eq(moveExpenses.userId, userId));
    await db.delete(plaidConnections).where(eq(plaidConnections.userId, userId));
    await db.delete(moveOutPhotos).where(eq(moveOutPhotos.userId, userId));
    await db.delete(leaseDocuments).where(eq(leaseDocuments.userId, userId));
    await db.delete(userBudgets).where(eq(userBudgets.userId, userId));
    await db.delete(movePartners).where(eq(movePartners.invitedBy, userId));
    await db.delete(notificationLog).where(eq(notificationLog.userId, userId));
    await db.delete(movingQuotes).where(eq(movingQuotes.userId, userId));
    await db.delete(budgetItems).where(eq(budgetItems.userId, userId));
    await db.delete(timelineMilestones).where(eq(timelineMilestones.userId, userId));
    await db.delete(relocationPlans).where(eq(relocationPlans.userId, userId));
    await db.delete(intakeResponses).where(eq(intakeResponses.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json<ApiResponse>(
      { data: { deleted: true }, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
