import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const AUTH_ROUTES = ["/login", "/register"];

const normalizePathname = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/";

const redirect = (request: NextRequest, location: string) => {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  const protocol = forwardedProtocol || request.nextUrl.protocol.slice(0, -1);
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin;

  return NextResponse.redirect(new URL(location, origin));
};

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
  const hasAuthCookie = Boolean(token);

  if (isProtectedRoute && !hasAuthCookie) {
    return redirect(request, "/login");
  }

  if (!isAuthRoute && !isProtectedRoute) {
    return redirect(
      request,
      hasAuthCookie ? "/?error=load" : "/login?error=load",
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
