import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Retell from "retell-sdk";

/** Creates a Retell web call and returns the access token for the frontend SDK. */
export async function POST() {
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

  try {
    const client = new Retell({ apiKey });

    const webCall = await client.call.createWebCall({
      agent_id: agentId,
      metadata: {
        user_id: session.user.id,
        user_name: session.user.name ?? "User",
      },
    });

    return NextResponse.json({
      accessToken: webCall.access_token,
      callId: webCall.call_id,
    });
  } catch (error) {
    console.error("Retell web call error:", error);
    return NextResponse.json(
      { error: "Failed to start voice call" },
      { status: 500 }
    );
  }
}
