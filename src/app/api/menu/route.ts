import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { readMenu, writeMenu } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await readMenu());
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const menu = await readMenu();
    const id = menu.length ? Math.max(...menu.map((m: { id: number }) => m.id)) + 1 : 1;
    const item = { ...body, id, inStock: body.inStock ?? true };
    menu.push(item);
    await writeMenu(menu);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to save menu item" },
      { status: 500 }
    );
  }
}
