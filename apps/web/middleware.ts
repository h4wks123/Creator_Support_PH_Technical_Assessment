import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/form/");

  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  // JWT validation and form ownership are enforced by the API. The
  // middleware only handles navigation based on whether a session cookie is
  // present, avoiding a second JWT implementation that can disagree with the
  // backend runtime.
  const isLoggedIn = Boolean(token);

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/form/:path*", "/login", "/register"],
};
