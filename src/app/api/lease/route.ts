import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  leaseDocuments,
  timelineMilestones,
  budgetItems,
  relocationPlans,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import { generateText } from "ai";

const LEASE_EXTRACTION_PROMPT = `You are a lease document analyzer. Extract the following information from this lease document text and return ONLY a valid JSON object (no markdown, no code fences, no explanation — just the JSON):

{
  "leaseEndDate": "YYYY-MM-DD or null",
  "leaseStartDate": "YYYY-MM-DD or null",
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
}

If you cannot extract certain fields, set them to null or empty arrays. Always provide a helpful summary even if data is limited.`;

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const { extractText } = await import("unpdf");
    const result = await extractText(new Uint8Array(buffer));
    const text = result.text;
    return Array.isArray(text) ? text.join("\n") : String(text);
  } catch (error) {
    console.error("PDF parse error:", error);
    return "";
  }
}

/** POST — Upload lease file (base64) and extract data via AI. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileData, fileName, fileType, fileSize } = await request.json();

  if (!fileData || !fileName) {
    return NextResponse.json({ error: "File data and filename are required" }, { status: 400 });
  }

  const db = getDb();

  const [doc] = await db
    .insert(leaseDocuments)
    .values({
      userId: session.user.id,
      fileName,
      fileType: fileType ?? "application/pdf",
      fileSize: fileSize ?? 0,
      status: "processing",
    })
    .returning();

  try {
    let leaseText: string;

    const isPdf = fileType?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      const buffer = Buffer.from(fileData, "base64");
      leaseText = await extractTextFromPdf(buffer);
      if (!leaseText.trim()) {
        await db
          .update(leaseDocuments)
          .set({ status: "failed" })
          .where(eq(leaseDocuments.id, doc.id));
        return NextResponse.json({
          error: "Could not extract text from this PDF. Try a text-based PDF (not a scanned image).",
        }, { status: 400 });
      }
    } else {
      leaseText = Buffer.from(fileData, "base64").toString("utf-8");
    }

    const anthropic = getAnthropic();
    const result = await generateText({
      model: anthropic(AI_MODEL),
      system: LEASE_EXTRACTION_PROMPT,
      prompt: leaseText.slice(0, 20000),
    });

    let extractedData;
    const cleaned = result.text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    try {
      extractedData = JSON.parse(cleaned);
    } catch {
      extractedData = { summary: result.text, parseError: true };
    }

    await db
      .update(leaseDocuments)
      .set({ extractedData, status: "completed" })
      .where(eq(leaseDocuments.id, doc.id));

    // Auto-generate milestones and budget items from lease data
    await applyLeaseToplan(session.user.id, extractedData);

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

/** Pushes extracted lease data into the user's timeline and budget. */
async function applyLeaseToplan(
  userId: string,
  data: Record<string, unknown>
) {
  const db = getDb();
  const [plan] = await db
    .select()
    .from(relocationPlans)
    .where(eq(relocationPlans.userId, userId))
    .orderBy(desc(relocationPlans.createdAt))
    .limit(1);

  if (!plan) return;

  const newMilestones = [];

  if (data.noticeRequired && typeof data.noticeRequired === "string") {
    const daysMatch = data.noticeRequired.match(/(\d+)/);
    const noticeDays = daysMatch ? parseInt(daysMatch[1]) : 30;
    const leaseEnd = data.leaseEndDate ? new Date(data.leaseEndDate as string) : new Date(plan.targetDate);
    const noticeDate = new Date(leaseEnd);
    noticeDate.setDate(noticeDate.getDate() - noticeDays);

    newMilestones.push({
      planId: plan.id,
      userId,
      title: `Give ${data.noticeRequired} notice to landlord`,
      description: "Required by your lease. Send written notice via certified mail for proof.",
      targetDate: noticeDate.toISOString().split("T")[0],
      sortOrder: 0,
      category: "admin" as const,
      isCompleted: false,
    });
  }

  if (data.leaseEndDate) {
    const endDate = new Date(data.leaseEndDate as string);
    const walkthrough = new Date(endDate);
    walkthrough.setDate(walkthrough.getDate() - 7);

    newMilestones.push({
      planId: plan.id,
      userId,
      title: "Schedule move-out walkthrough with landlord",
      description: "Do this before your lease ends to document the condition together and avoid disputes.",
      targetDate: walkthrough.toISOString().split("T")[0],
      sortOrder: 1,
      category: "admin" as const,
      isCompleted: false,
    });
  }

  const checklist = data.moveOutChecklist as string[] | undefined;
  if (Array.isArray(checklist) && checklist.length > 0) {
    const leaseEnd = data.leaseEndDate ? new Date(data.leaseEndDate as string) : new Date(plan.targetDate);
    const cleaningDate = new Date(leaseEnd);
    cleaningDate.setDate(cleaningDate.getDate() - 3);

    checklist.slice(0, 5).forEach((task, i) => {
      newMilestones.push({
        planId: plan.id,
        userId,
        title: task,
        description: "Required by your lease agreement.",
        targetDate: cleaningDate.toISOString().split("T")[0],
        sortOrder: 10 + i,
        category: "logistics" as const,
        isCompleted: false,
      });
    });
  }

  const cleaning = data.cleaningRequirements as string[] | undefined;
  if (Array.isArray(cleaning) && cleaning.length > 0) {
    const leaseEnd = data.leaseEndDate ? new Date(data.leaseEndDate as string) : new Date(plan.targetDate);
    const cleanDate = new Date(leaseEnd);
    cleanDate.setDate(cleanDate.getDate() - 2);

    newMilestones.push({
      planId: plan.id,
      userId,
      title: "Professional cleaning (lease requirement)",
      description: `Your lease requires: ${cleaning.join(", ")}`,
      targetDate: cleanDate.toISOString().split("T")[0],
      sortOrder: 20,
      category: "logistics" as const,
      isCompleted: false,
    });
  }

  if (data.keyReturnInstructions) {
    const leaseEnd = data.leaseEndDate ? new Date(data.leaseEndDate as string) : new Date(plan.targetDate);
    newMilestones.push({
      planId: plan.id,
      userId,
      title: "Return keys to landlord",
      description: data.keyReturnInstructions as string,
      targetDate: leaseEnd.toISOString().split("T")[0],
      sortOrder: 30,
      category: "admin" as const,
      isCompleted: false,
    });
  }

  if (newMilestones.length > 0) {
    await db.insert(timelineMilestones).values(newMilestones);
  }

  // Add deposit recovery to budget if not already tracked
  if (data.securityDeposit && typeof data.securityDeposit === "number") {
    const deposit = data.securityDeposit;
    await db.insert(budgetItems).values({
      planId: plan.id,
      userId,
      category: "finance",
      label: "Security deposit recovery",
      estimatedLow: Math.round(deposit * 0.7),
      estimatedHigh: deposit,
      notes: `Your lease shows a $${deposit} deposit. Meet all move-out requirements to maximize your refund.`,
    });
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
