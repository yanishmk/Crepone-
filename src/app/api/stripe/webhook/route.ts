import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getPendingStripeOrder,
  markPendingStripeOrderSent,
} from "@/lib/pendingStripeOrders";

export const runtime = "nodejs";

const HUB_URL = process.env.CLUSTER_HUB_URL || "http://localhost:3000";
const HUB_API_KEY = process.env.CLUSTER_HUB_WEBSITE_API_KEY || "";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook non configure" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signature Stripe invalide" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const pending = getPendingStripeOrder(session.id);
  if (!pending) {
    return NextResponse.json(
      { error: `Commande Stripe introuvable pour session ${session.id}` },
      { status: 404 }
    );
  }

  if (pending.sentToHubAt) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const hubRes = await fetch(`${HUB_URL}/orders/website`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": HUB_API_KEY },
    body: JSON.stringify(pending.order),
  });

  const hubBody = await hubRes.text();
  if (!hubRes.ok) {
    return NextResponse.json(
      { error: "Le hub de commandes a refuse la commande payee", details: hubBody },
      { status: 502 }
    );
  }

  markPendingStripeOrderSent(session.id);

  return NextResponse.json({
    received: true,
    order: JSON.parse(hubBody),
  });
}
