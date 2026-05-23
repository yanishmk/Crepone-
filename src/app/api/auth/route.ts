import { NextResponse } from "next/server";
import crypto from "crypto";

const PWD = process.env.ADMIN_PASSWORD || "crepone2024";
const SECRET = process.env.AUTH_SECRET || "crepone-secret-key-2024";

export function makeToken() {
  return crypto.createHmac("sha256", SECRET).update(PWD).digest("hex");
}

export async function POST(req: Request) {
  const { password, action } = await req.json();

  if (action === "logout") {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  if (password !== PWD) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const token = makeToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
