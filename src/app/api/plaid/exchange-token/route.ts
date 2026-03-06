import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { getDb } from "@/lib/db";
import { plaidConnections } from "@/lib/db/schema";

function getPlaidClient() {
  const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || "sandbox"],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET!,
      },
    },
  });
  return new PlaidApi(config);
}

/** POST — Exchange public token for access token after Plaid Link success. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicToken, institutionName } = await request.json();

  if (!publicToken) {
    return NextResponse.json({ error: "Public token required" }, { status: 400 });
  }

  try {
    const plaid = getPlaidClient();
    const response = await plaid.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const db = getDb();
    await db.insert(plaidConnections).values({
      userId: session.user.id,
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
      institutionName: institutionName ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plaid token exchange error:", error);
    return NextResponse.json({ error: "Failed to connect account" }, { status: 500 });
  }
}
