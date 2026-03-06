import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { moveOutPhotos } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB base64

/** POST — Save a move-out photo. */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { room, caption, imageData } = await request.json();

    if (!room || !imageData) {
      return NextResponse.json({ error: "Room and image data are required" }, { status: 400 });
    }

    if (typeof imageData !== "string" || imageData.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image is too large (max 10 MB)" }, { status: 400 });
    }

    const db = getDb();
    const [photo] = await db
      .insert(moveOutPhotos)
      .values({
        userId: session.user.id,
        room: String(room).slice(0, 100),
        caption: caption ? String(caption).slice(0, 500) : null,
        imageData,
      })
      .returning();

    return NextResponse.json({ data: { id: photo.id } });
  } catch (error) {
    console.error("Photos POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** GET — Retrieve user's move-out photos. */
export async function GET() {
  try {
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
  } catch (error) {
    console.error("Photos GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE — Remove a photo (scoped to current user). */
export async function DELETE(request: Request) {
  try {
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
    await db
      .delete(moveOutPhotos)
      .where(and(eq(moveOutPhotos.id, photoId), eq(moveOutPhotos.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Photos DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
