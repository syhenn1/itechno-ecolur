import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, type Role } from "@/lib/session";

// Route-group parentheses — (citizen), (officer), (admin) — don't appear in the actual URL,
// so matching is on the real paths underneath them.
const ROLE_PREFIXES: Record<Role, string[]> = {
  CITIZEN: ["/energy", "/report", "/my-reports"],
  OFFICER: ["/incoming-reports"],
  ADMIN: ["/dashboard"],
};

const PROTECTED_PREFIXES = Object.values(ROLE_PREFIXES).flat();

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const session = await getSession();
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefixes = ROLE_PREFIXES[session.role] ?? [];
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!isAllowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/energy/:path*", "/report/:path*", "/my-reports/:path*", "/incoming-reports/:path*", "/dashboard/:path*"],
};
