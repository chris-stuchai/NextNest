import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  users,
  intakeResponses,
  relocationPlans,
  timelineMilestones,
} from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import type { ApiResponse } from "@/types";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  hasIntake: boolean;
  hasPlan: boolean;
  milestonesCompleted: number;
  milestonesTotal: number;
}

/** GET /api/admin/users — Returns all users with engagement summary. */
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

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const enrichedUsers: AdminUser[] = await Promise.all(
      allUsers.map(async (user) => {
        const [intakeCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(intakeResponses)
          .where(eq(intakeResponses.userId, user.id));

        const [planCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(relocationPlans)
          .where(eq(relocationPlans.userId, user.id));

        const [milestoneStats] = await db
          .select({
            total: sql<number>`count(*)`,
            completed: sql<number>`count(*) filter (where ${timelineMilestones.isCompleted} = true)`,
          })
          .from(timelineMilestones)
          .where(eq(timelineMilestones.userId, user.id));

        return {
          ...user,
          hasIntake: Number(intakeCount.count) > 0,
          hasPlan: Number(planCount.count) > 0,
          milestonesCompleted: Number(milestoneStats?.completed ?? 0),
          milestonesTotal: Number(milestoneStats?.total ?? 0),
        };
      })
    );

    return NextResponse.json<ApiResponse<AdminUser[]>>(
      { data: enrichedUsers, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
