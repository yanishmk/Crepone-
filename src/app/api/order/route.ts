import { NextResponse } from "next/server";
import crypto from "crypto";

const HUB_URL = process.env.CLUSTER_HUB_URL || "http://localhost:3000";
const HUB_API_KEY = process.env.CLUSTER_HUB_WEBSITE_API_KEY || "";

// Taxe combinée TPS (5%) + TVQ (9.975%) — taux standard applicable aux repas
// préparés au Québec. À ajuster si un traitement fiscal différent s'applique.
const QC_TAX_RATE = 0.14975;

interface OrderItemInput {
  name: string;
  price: string; // ex: "$9.99"
  quantity: number;
}

interface OrderRequestBody {
  customer: { name: string; phone?: string };
  orderType: "pickup" | "dine_in";
  requestedFor?: string;
  items: OrderItemInput[];
}

function parsePrice(price: string): number {
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function POST(req: Request) {
  const body = (await req.json()) as OrderRequestBody;

  if (!body.customer?.name || !body.items?.length) {
    return NextResponse.json({ error: "Commande invalide" }, { status: 400 });
  }

  const items = body.items.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    unitPrice: parsePrice(i.price),
    modifiers: [] as { name: string; price: number }[],
  }));

  const subtotal = round2(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));
  const tax = round2(subtotal * QC_TAX_RATE);
  const total = round2(subtotal + tax);

  const payload = {
    externalId: crypto.randomUUID(),
    orderType: body.orderType,
    requestedFor: body.requestedFor,
    customer: { name: body.customer.name, phone: body.customer.phone },
    items,
    subtotal,
    tax,
    total,
    paymentStatus: "pay_at_pos" as const,
  };

  try {
    const hubRes = await fetch(`${HUB_URL}/orders/website`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": HUB_API_KEY },
      body: JSON.stringify(payload),
    });

    const hubBody = await hubRes.text();

    if (!hubRes.ok) {
      return NextResponse.json(
        { error: "Le hub de commandes a refusé la commande", details: hubBody },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(hubBody), { status: 202 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Impossible de joindre le hub de commandes",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
