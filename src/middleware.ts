import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PWD    = process.env.ADMIN_PASSWORD || "crepone2024";
const SECRET = process.env.AUTH_SECRET    || "crepone-secret-key-2024";

function validToken(token: string) {
  const expected = crypto.createHmac("sha256", SECRET).update(PWD).digest("hex");
  return token === expected;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login")   return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token || !validToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
