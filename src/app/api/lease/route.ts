import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { leaseDocuments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import { generateText } from "ai";

const LEASE_EXTRACTION_PROMPT = `You are a lease document analyzer. Extract the following information from this lease document text and return ONLY a valid JSON object (no markdown, no explanation):

{
  "leaseEndDate": "YYYY-MM-DD or null",
  "monthlyRent": number or null,
  "securityDeposit": number or null,
  "noticeRequired": "e.g. 30 days, 60 days, or null",
  "moveOutChecklist": ["list of required move-out tasks from the lease"],
  "cleaningRequirements": ["specific cleaning requirements mentioned"],
  "penalties": ["any penalties for early termination or damage"],
  "landlordContact": "name and/or phone if mentioned, or null",
  "petDeposit": number or null,
  "utilities": ["utilities tenant is responsible for"],
  "keyReturnInstructions": "instructions if mentioned, or null",
  "importantDates": [{"date": "YYYY-MM-DD", "description": "what happens"}],
  "summary": "2-3 sentence plain English summary of the key move-out requirements"
}`;

/** POST — Upload lease text and extract data via AI. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text: leaseText, fileName, fileType, fileSize } = await request.json();

  if (!leaseText || !fileName) {
    return NextResponse.json({ error: "Lease text and filename are required" }, { status: 400 });
  }

  const db = getDb();

  const [doc] = await db
    .insert(leaseDocuments)
    .values({
      userId: session.user.id,
      fileName,
      fileType: fileType ?? "text/plain",
      fileSize: fileSize ?? leaseText.length,
      status: "processing",
    })
    .returning();

  try {
    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: LEASE_EXTRACTION_PROMPT,
      prompt: leaseText.slice(0, 15000),
    });

    let extractedData;
    try {
      extractedData = JSON.parse(result.text);
    } catch {
      extractedData = { summary: result.text, parseError: true };
    }

    await db
      .update(leaseDocuments)
      .set({ extractedData, status: "completed" })
      .where(eq(leaseDocuments.id, doc.id));

    return NextResponse.json({ data: { id: doc.id, extractedData } });
  } catch (error) {
    console.error("Lease parsing error:", error);
    await db
      .update(leaseDocuments)
      .set({ status: "failed" })
      .where(eq(leaseDocuments.id, doc.id));

    return NextResponse.json({ error: "Failed to analyze lease" }, { status: 500 });
  }
}

/** GET — Retrieve user's lease documents. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const docs = await db
    .select()
    .from(leaseDocuments)
    .where(eq(leaseDocuments.userId, session.user.id))
    .orderBy(desc(leaseDocuments.createdAt));

  return NextResponse.json({ data: docs });
}
