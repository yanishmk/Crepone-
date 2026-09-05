import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { readPromotions, writePromotions, type Promotion } from "@/lib/menuStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await readPromotions());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to read promotions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const promotion = normalizePromotion({
      ...(await req.json()),
      id: crypto.randomUUID(),
    });
    const promotions = await readPromotions();
    promotions.push(promotion);
    await writePromotions(promotions);
    return NextResponse.json(promotion, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to save promotion" },
      { status: 500 }
    );
  }
}

export function normalizePromotion(input: Record<string, unknown>): Promotion {
  const base = {
    id: String(input.id),
    enabled: Boolean(input.enabled),
    name: String(input.name || "Promotion"),
  };

  if (input.type === "percent") {
    return {
      ...base,
      type: "percent",
      percentOff: numberValue(input.percentOff, 10),
      minimumSubtotal: optionalNumber(input.minimumSubtotal),
      appliesToItemIds: numberArray(input.appliesToItemIds),
    };
  }

  if (input.type === "buy_get") {
    return {
      ...base,
      type: "buy_get",
      itemId: numberValue(input.itemId, 0),
      buyQuantity: numberValue(input.buyQuantity, 1),
      getQuantity: numberValue(input.getQuantity, 1),
    };
  }

  return {
    ...base,
    type: "free_item_threshold",
    freeItemId: numberValue(input.freeItemId, 0),
    minimumSubtotal: numberValue(input.minimumSubtotal, 25),
  };
}

function numberValue(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return numberValue(value, 0);
}

function numberArray(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.map(Number).filter((number) => Number.isInteger(number) && number > 0);
  return values.length ? values : undefined;
}
