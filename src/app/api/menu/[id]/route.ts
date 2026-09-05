import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { readMenu, writeMenu } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const menu = await readMenu();
    const idx = menu.findIndex((m: { id: number }) => m.id === parseInt(id));
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    menu[idx] = { ...menu[idx], ...body };
    await writeMenu(menu);
    return NextResponse.json(menu[idx]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const menu = (await readMenu()).filter((m: { id: number }) => m.id !== parseInt(id));
    await writeMenu(menu);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to delete menu item" },
      { status: 500 }
    );
  }
}
