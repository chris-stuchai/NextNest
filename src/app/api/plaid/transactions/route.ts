import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { getDb } from "@/lib/db";
import { plaidConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

/** GET — Fetch recent transactions from Plaid for expense tagging. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const connections = await db
    .select()
    .from(plaidConnections)
    .where(eq(plaidConnections.userId, session.user.id));

  if (connections.length === 0) {
    return NextResponse.json({ data: [], connected: false });
  }

  try {
    const plaid = getPlaidClient();
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const allTransactions = [];

    for (const conn of connections) {
      const response = await plaid.transactionsGet({
        access_token: conn.accessToken,
        start_date: threeMonthsAgo.toISOString().split("T")[0],
        end_date: now.toISOString().split("T")[0],
        options: { count: 100, offset: 0 },
      });

      allTransactions.push(
        ...response.data.transactions.map((t) => ({
          id: t.transaction_id,
          name: t.name,
          amount: Math.round(t.amount * 100),
          category: t.personal_finance_category?.primary ?? t.category?.[0] ?? "Other",
          date: t.date,
          institution: conn.institutionName,
        }))
      );
    }

    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ data: allTransactions, connected: true });
  } catch (error) {
    console.error("Plaid transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
