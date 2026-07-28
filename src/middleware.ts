import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/admin/auth";
import { USER_COOKIE, verifyUserSessionToken } from "@/lib/auth/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const token = request.cookies.get(ADMIN_COOKIE)?.value;
      if (await verifyAdminSessionToken(token)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    const isAuthPage =
      pathname === "/account/login" ||
      pathname === "/account/register" ||
      pathname === "/account/forgot-password" ||
      pathname === "/account/reset-password";
    const token = request.cookies.get(USER_COOKIE)?.value;
    const session = await verifyUserSessionToken(token);

    if (isAuthPage) {
      if (session) {
        return NextResponse.redirect(new URL("/account", request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      const login = new URL("/account/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*"],
};
