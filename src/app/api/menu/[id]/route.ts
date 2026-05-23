import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA = path.join(process.cwd(), "data", "menu.json");

function read() { return JSON.parse(fs.readFileSync(DATA, "utf-8")); }
function write(d: unknown) { fs.writeFileSync(DATA, JSON.stringify(d, null, 2)); }

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const menu = read();
  const idx = menu.findIndex((m: { id: number }) => m.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  menu[idx] = { ...menu[idx], ...body };
  write(menu);
  return NextResponse.json(menu[idx]);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = read().filter((m: { id: number }) => m.id !== parseInt(id));
  write(menu);
  return NextResponse.json({ success: true });
}
