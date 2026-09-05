import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { readPromotions, writePromotions } from "@/lib/menuStore";
import { normalizePromotion } from "../route";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const promotions = await readPromotions();
    const idx = promotions.findIndex((promo) => promo.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    promotions[idx] = normalizePromotion({ ...promotions[idx], ...body, id });
    await writePromotions(promotions);
    return NextResponse.json(promotions[idx]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to update promotion" },
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
    await writePromotions((await readPromotions()).filter((promo) => promo.id !== id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to delete promotion" },
      { status: 500 }
    );
  }
}
