// app/api/debug-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  
  const tokenWithSecure = await getToken({
    req,
    secret,
    cookieName: "__Secure-next-auth.session-token",
  });

  const tokenWithoutSecure = await getToken({
    req,
    secret,
    cookieName: "next-auth.session-token",
  });

  // Also try with authjs cookie name (NextAuth v5 uses different name)
  const tokenAuthJs = await getToken({
    req,
    secret,
    cookieName: "__Secure-authjs.session-token",
  });

  return NextResponse.json({
    tokenWithSecure,
    tokenWithoutSecure,
    tokenAuthJs,
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      secretsMatch: process.env.AUTH_SECRET === process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    }
  });
}