import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users,
  intakeResponses,
  relocationPlans,
  timelineMilestones,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { ApiResponse } from "@/types";

interface AdminStats {
  totalUsers: number;
  completedIntakes: number;
  activePlans: number;
  totalMilestones: number;
  completedMilestones: number;
  milestoneCompletionRate: number;
}

/** GET /api/admin/stats — Returns engagement metrics for the admin dashboard. */
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

    const [currentUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (currentUser?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "Forbidden", status: 403 },
        { status: 403 }
      );
    }

    const [[totalUsers], [completedIntakes], [activePlans], [milestoneStats]] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(intakeResponses),
        db.select({ count: sql<number>`count(*)` }).from(relocationPlans),
        db
          .select({
            total: sql<number>`count(*)`,
            completed: sql<number>`count(*) filter (where ${timelineMilestones.isCompleted} = true)`,
          })
          .from(timelineMilestones),
      ]);

    const total = Number(milestoneStats.total);
    const completed = Number(milestoneStats.completed);

    const stats: AdminStats = {
      totalUsers: Number(totalUsers.count),
      completedIntakes: Number(completedIntakes.count),
      activePlans: Number(activePlans.count),
      totalMilestones: total,
      completedMilestones: completed,
      milestoneCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };

    return NextResponse.json<ApiResponse<AdminStats>>(
      { data: stats, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
