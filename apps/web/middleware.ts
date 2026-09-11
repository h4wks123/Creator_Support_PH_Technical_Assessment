import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const AUTH_ROUTES = ["/login", "/register"];
const API_URL = process.env.NEXT_PUBLIC_APP_API_URL ?? "http://localhost:5000";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isResponseRoute = /^\/forms\/[^/]+\/responses(?:\/|$)/.test(pathname);
  const isProtectedRoute =
    pathname === "/" || pathname.startsWith("/forms/") || isResponseRoute;

  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isLoggedIn = Boolean(token);

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isResponseRoute && token) {
    const responsePath = pathname.match(/^\/forms\/([^/]+)\/responses/);
    const formId = responsePath?.[1];

    if (formId) {
      try {
        const formsResponse = await fetch(`${API_URL}/api/forms`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (formsResponse.status === 401 || formsResponse.status === 403) {
          return NextResponse.redirect(new URL("/login", request.url));
        }

        if (formsResponse.ok) {
          const data = (await formsResponse.json()) as {
            forms?: Array<{ form_id?: string }>;
          };
          const ownsForm = data.forms?.some(
            (form) => form.form_id === decodeURIComponent(formId),
          );
          if (!ownsForm)
            return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/forms/:path*", "/f/:path*", "/login", "/register"],
};
