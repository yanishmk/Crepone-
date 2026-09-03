import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/adminAuth";

const DATA = path.join(process.cwd(), "data", "menu.json");

function read() { return JSON.parse(fs.readFileSync(DATA, "utf-8")); }
function write(d: unknown) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const menu = read();
  const id = menu.length ? Math.max(...menu.map((m: { id: number }) => m.id)) + 1 : 1;
  const item = { ...body, id, inStock: body.inStock ?? true };
  menu.push(item);
  write(menu);
  return NextResponse.json(item, { status: 201 });
}
