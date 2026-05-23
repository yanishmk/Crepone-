import { NextRequest, NextResponse } from "next/server";

const PWD    = process.env.ADMIN_PASSWORD || "crepone2024";
const SECRET = process.env.AUTH_SECRET    || "crepone-secret-key-2024";

async function makeExpected() {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(PWD));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login")   return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

  const expected = await makeExpected();
  if (token !== expected) return NextResponse.redirect(new URL("/admin/login", req.url));

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
