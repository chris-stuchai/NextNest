import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/admin"];
const AUTH_ROUTES = ["/login", "/signup", "/verify"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!session?.user;

  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Policy", "100;w=60");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
