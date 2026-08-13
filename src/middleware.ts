import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth-server";

const PROTECTED_PREFIXES = ["/account", "/dashboard", "/api/auth/profile"];
const ADMIN_PREFIXES = ["/admin", "/api/admin"];

// Very small in-memory rate limiter (per-process; suitable for prototype/edge demo)
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 30;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit auth-related API/mutations
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/admin/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";
    if (rateLimited(`${ip}:${pathname}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Admin area: strict server-side role verification via signed cookie
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    // The login page and login API are public entry points (no cookie required)
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const admin = cookie ? await verifyAdminToken(cookie) : null;
    if (!admin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Standard protected routes: require a valid NextAuth session
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)"],
};
