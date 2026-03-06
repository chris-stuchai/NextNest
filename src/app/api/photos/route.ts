import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { moveOutPhotos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/** POST — Save a move-out photo. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { room, caption, imageData } = await request.json();

  if (!room || !imageData) {
    return NextResponse.json({ error: "Room and image data are required" }, { status: 400 });
  }

  const db = getDb();
  const [photo] = await db
    .insert(moveOutPhotos)
    .values({
      userId: session.user.id,
      room,
      caption: caption ?? null,
      imageData,
    })
    .returning();

  return NextResponse.json({ data: { id: photo.id } });
}

/** GET — Retrieve user's move-out photos. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const photos = await db
    .select({
      id: moveOutPhotos.id,
      room: moveOutPhotos.room,
      caption: moveOutPhotos.caption,
      createdAt: moveOutPhotos.createdAt,
    })
    .from(moveOutPhotos)
    .where(eq(moveOutPhotos.userId, session.user.id))
    .orderBy(desc(moveOutPhotos.createdAt));

  return NextResponse.json({ data: photos });
}

/** DELETE — Remove a photo. */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get("id");
  if (!photoId) {
    return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
  }

  const db = getDb();
  await db.delete(moveOutPhotos).where(eq(moveOutPhotos.id, photoId));

  return NextResponse.json({ success: true });
}
