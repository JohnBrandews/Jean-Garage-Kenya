import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: authSecret });
  const isLoggedIn = Boolean(token);
  const isAdmin = token?.role === "ADMIN";

  if (pathname.startsWith("/admin") && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search || "/admin")}`, req.url));
  }

  if ((pathname.startsWith("/cart") || pathname.startsWith("/checkout") || pathname.startsWith("/account")) && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search || "/")}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/cart", "/checkout"],
};
