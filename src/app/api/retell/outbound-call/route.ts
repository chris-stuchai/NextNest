import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { movingQuotes, relocationPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Retell from "retell-sdk";

/** Initiates an outbound Retell AI call to a moving company for a quote. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "Voice AI is not configured" },
      { status: 503 }
    );
  }

  const { companyName, phoneNumber } = await request.json();

  if (!companyName || !phoneNumber) {
    return NextResponse.json(
      { error: "Company name and phone number are required" },
      { status: 400 }
    );
  }

  const db = getDb();

  const [plan] = await db
    .select()
    .from(relocationPlans)
    .where(eq(relocationPlans.userId, session.user.id))
    .limit(1);

  if (!plan) {
    return NextResponse.json({ error: "No relocation plan found" }, { status: 404 });
  }

  try {
    const client = new Retell({ apiKey });

    const phoneCall = await client.call.createPhoneCall({
      from_number: process.env.RETELL_PHONE_NUMBER ?? "",
      to_number: phoneNumber,
      metadata: {
        user_id: session.user.id,
        plan_id: plan.id,
        company_name: companyName,
        purpose: "moving_quote",
      },
    });

    const [quote] = await db
      .insert(movingQuotes)
      .values({
        planId: plan.id,
        userId: session.user.id,
        companyName,
        phoneNumber,
        callId: phoneCall.call_id,
        status: "calling",
      })
      .returning();

    return NextResponse.json({
      quoteId: quote.id,
      callId: phoneCall.call_id,
      status: "calling",
    });
  } catch (error) {
    console.error("Retell outbound call error:", error);
    return NextResponse.json(
      { error: "Failed to initiate call" },
      { status: 500 }
    );
  }
}
