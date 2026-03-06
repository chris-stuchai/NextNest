import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

/** GET /api/admin/users/[id] — Returns a single user's profile. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: "User not found", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { data: user, error: null, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json<ApiResponse>(
      { data: null, error: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
