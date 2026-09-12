import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const AUTH_ROUTES = ["/login", "/register"];

const normalizePathname = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/";

export async function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isFormRoute =
    /^\/forms\/[^/]+(?:\/responses(?:\/[^/]+)?|\/webhook)?$/.test(pathname);
  const isProtectedRoute = pathname === "/" || isFormRoute;
  const isPublicFormRoute = /^\/f\/[^/]+$/.test(pathname);

  if (pathname.includes(".")) return NextResponse.next();

  if (isPublicFormRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isLoggedIn = Boolean(token);

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/" : "/login", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
