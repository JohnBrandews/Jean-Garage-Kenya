import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authDebug = process.env.AUTH_DEBUG === "true";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production" 
      ? "__Secure-next-auth.session-token" 
      : "next-auth.session-token"
  });

  const isLoggedIn = Boolean(token);
  const isAdmin = token?.role === "ADMIN";

  if (authDebug) {
    console.log("[auth][middleware]", {
      path: pathname,
      isLoggedIn,
      isAdmin,
      role: token?.role ?? null,
      userId: token?.id ?? null,
    });
  }

  if (pathname.startsWith("/admin") && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search || "/admin")}`, req.url)
    );
  }

  if (
    (pathname.startsWith("/cart") || 
     pathname.startsWith("/checkout") || 
     pathname.startsWith("/account")) && 
    !isLoggedIn
  ) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search || "/")}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/cart", "/checkout"],
};
