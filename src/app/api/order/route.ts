import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createHubOrderPayload,
  type CheckoutOrderRequest,
} from "@/lib/checkoutOrder";

const HUB_URL = process.env.CLUSTER_HUB_URL || "http://localhost:3000";
const HUB_API_KEY = process.env.CLUSTER_HUB_WEBSITE_API_KEY || "";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (process.env.ENABLE_PAY_AT_POS_ORDERS !== "true") {
    return NextResponse.json(
      { error: "Les commandes directes sans paiement sont desactivees" },
      { status: 403 }
    );
  }

  try {
    const body = (await req.json()) as CheckoutOrderRequest;
    const payload = createHubOrderPayload(body, crypto.randomUUID(), "pay_at_pos");

    const hubRes = await fetch(`${HUB_URL}/orders/website`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": HUB_API_KEY },
      body: JSON.stringify(payload),
    });

    const hubBody = await hubRes.text();

    if (!hubRes.ok) {
      return NextResponse.json(
        { error: "Le hub de commandes a refuse la commande", details: hubBody },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(hubBody), { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes("fetch failed") ? 502 : 400;
    return NextResponse.json(
      {
        error: status === 502 ? "Impossible de joindre le hub de commandes" : message,
        details: message,
      },
      { status }
    );
  }
}
