import crypto from "crypto";
import { cookies } from "next/headers";

function adminPassword(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is not configured");
  return value;
}

function authSecret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}

export function makeAdminToken() {
  return crypto.createHmac("sha256", authSecret()).update(adminPassword()).digest("hex");
}

export function isValidAdminPassword(password: string) {
  return safeEqual(password, adminPassword());
}

export async function isAdminRequest() {
  const token = (await cookies()).get("admin_token")?.value;
  return Boolean(token && safeEqual(token, makeAdminToken()));
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
