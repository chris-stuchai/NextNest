import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { movingQuotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RetellWebhookEvent {
  event: "call_started" | "call_ended" | "call_analyzed";
  call: {
    call_id: string;
    call_status?: string;
    transcript?: string;
    call_analysis?: {
      custom_analysis_data?: {
        quote_low?: number;
        quote_high?: number;
        notes?: string;
      };
    };
  };
}

/** Receives Retell AI call status webhooks and updates the moving_quotes table. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RetellWebhookEvent;
    const { event, call } = body;
    const db = getDb();

    if (!call?.call_id) {
      return NextResponse.json({ received: true });
    }

    switch (event) {
      case "call_started":
        await db
          .update(movingQuotes)
          .set({ status: "connected", updatedAt: new Date() })
          .where(eq(movingQuotes.callId, call.call_id));
        break;

      case "call_ended":
        await db
          .update(movingQuotes)
          .set({
            status: "completed",
            transcript: call.transcript ?? null,
            updatedAt: new Date(),
          })
          .where(eq(movingQuotes.callId, call.call_id));
        break;

      case "call_analyzed":
        if (call.call_analysis?.custom_analysis_data) {
          const analysis = call.call_analysis.custom_analysis_data;
          await db
            .update(movingQuotes)
            .set({
              quoteLow: analysis.quote_low ?? null,
              quoteHigh: analysis.quote_high ?? null,
              notes: analysis.notes ?? null,
              updatedAt: new Date(),
            })
            .where(eq(movingQuotes.callId, call.call_id));
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Retell webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
