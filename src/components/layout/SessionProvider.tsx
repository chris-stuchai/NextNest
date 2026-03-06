"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/** Client-side session provider wrapping next-auth's SessionProvider. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
