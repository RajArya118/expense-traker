import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "expenseflow_session";

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "expenseflow_dev_secret_key_8f3a2b1c9d0e4f5a6b7c8d9e0f1a2b3c"
);

// Public authentication paths
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, secretKey, {
        algorithms: ["HS256"],
      });
      if (payload.userId) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. If user is authenticated and tries to visit /login or /register, send them to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If user is NOT authenticated and tries to visit a protected route, send to /login
  if (!isAuthRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
