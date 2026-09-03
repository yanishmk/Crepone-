import { NextResponse } from "next/server";
import { isValidAdminPassword, makeAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";

export const makeToken = makeAdminToken;

export async function POST(req: Request) {
  const { password, action } = await req.json();

  if (action === "logout") {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  if (!isValidAdminPassword(String(password ?? ""))) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const token = makeAdminToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
