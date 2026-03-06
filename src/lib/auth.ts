import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import EmailProvider from "next-auth/providers/email";
import { getDb } from "@/lib/db";
import { getResend, emailFrom } from "@/lib/resend";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const db = getDb();

  return {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      EmailProvider({
        from: emailFrom,
        async sendVerificationRequest({ identifier: email, url }) {
          const resend = getResend();
          await resend.emails.send({
            from: emailFrom,
            to: email,
            subject: "Sign in to NextNest",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin-bottom: 8px;">Welcome to NextNest</h1>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                  Click the button below to securely access your relocation dashboard. This link expires in 24 hours.
                </p>
                <a href="${url}" style="display: inline-block; background-color: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                  Sign in to NextNest
                </a>
                <p style="color: #999; font-size: 13px; margin-top: 32px; line-height: 1.5;">
                  If you didn't request this email, you can safely ignore it. Save this email for easy access to your dashboard later.
                </p>
              </div>
            `,
          });
        },
      }),
    ],
    pages: {
      signIn: "/login",
      verifyRequest: "/verify",
    },
    session: {
      strategy: "database" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60,   // refresh session token every 24h
    },
    callbacks: {
      async session({ session, user }) {
        session.user.id = user.id;
        return session;
      },
    },
  };
});
