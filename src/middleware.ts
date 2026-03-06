import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/admin"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/verify"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Redirect authenticated users away from login pages
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rate-limit API routes: add rate-limit headers (enforcement is at edge/proxy level)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Policy", "100;w=60");
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
