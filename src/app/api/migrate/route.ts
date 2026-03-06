import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/migrate — One-time migration to add hashed_password column.
 * Protected by CRON_SECRET to prevent public access.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS hashed_password TEXT
    `);

    return NextResponse.json({
      data: "Migration complete: hashed_password column added",
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
